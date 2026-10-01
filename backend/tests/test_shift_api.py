import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch
from fastapi import HTTPException, FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, lazyload
from sqlalchemy.pool import StaticPool
from app.models import User, Trip, Shift, ShiftPlatformSession, ShiftSegment, TripCategory
from app.schemas.v1.shift import ShiftSnapshot
from app.services.shift_service import sync_shift, get_shift, snapshot

class ShiftApiTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
        @event.listens_for(self.engine, 'connect')
        def foreign_keys(connection, _): connection.execute('PRAGMA foreign_keys=ON')
        for model in (User, Trip, Shift, ShiftPlatformSession, ShiftSegment): model.__table__.create(self.engine)
        self.db = Session(self.engine)
        self.db.add_all([User(id=i, first_name='Test', last_name='User', email=f'{i}@example.com') for i in (1,2)])
        self.db.commit()
        self.now = datetime(2026,9,28,tzinfo=timezone.utc)
    def tearDown(self): self.db.close(); self.engine.dispose()
    def data(self, **changes):
        return ShiftSnapshot.model_validate(dict(client_id='shift-1', revision=1, started_at=self.now,
            platform_sessions=[dict(client_id='p1', platform='spark', started_at=self.now)], **changes))
    def test_retry_after_response_loss_and_owner_scoping(self):
        a=sync_shift(self.db,1,self.data())
        self.db.close(); self.db=Session(self.engine)
        self.assertEqual(sync_shift(self.db,1,self.data()),a)
        sync_shift(self.db,2,self.data())
        self.assertEqual(self.db.query(Shift).count(),2)
        self.assertEqual(self.db.query(ShiftPlatformSession).count(),2)
    def test_same_revision_conflict_and_no_overwrite(self):
        sync_shift(self.db,1,self.data())
        with self.assertRaises(HTTPException) as error: sync_shift(self.db,1,self.data(planned_end_at=self.now+timedelta(hours=2)))
        self.assertEqual(error.exception.status_code,409)
        self.assertIsNone(get_shift(self.db,1,'shift-1').planned_end_at)
    def test_one_active_and_cross_user_lookup(self):
        sync_shift(self.db,1,self.data())
        other=self.data().model_copy(update={'client_id':'shift-2'})
        with self.assertRaises(HTTPException): sync_shift(self.db,1,other)
        with self.assertRaises(HTTPException) as error: get_shift(self.db,2,'shift-1')
        self.assertEqual(error.exception.status_code,404)
    def test_switch_segment_edit_end_and_repeated_end(self):
        data=sync_shift(self.db,1,self.data())
        switch=self.now+timedelta(hours=1)
        data.revision+=1; data.platform_sessions[0].ended_at=switch
        payload=data.model_dump(); payload['platform_sessions'].append(dict(client_id='p2',platform='doordash',started_at=switch))
        payload['segments']=[dict(client_id='s1',started_at=self.now,ended_at=switch,distance_miles='5.25',category='personal',platform_client_id='p1')]
        data=sync_shift(self.db,1,ShiftSnapshot.model_validate(payload))
        data.revision+=1; data.segments[0].category=TripCategory.BUSINESS; data.segments[0].excluded=True; data.segments[0].platform_client_id='p2'
        data=sync_shift(self.db,1,ShiftSnapshot.model_validate(data.model_dump()))
        self.assertTrue(data.segments[0].excluded)
        data.revision+=1; data.ended_at=switch+timedelta(hours=1); data.platform_sessions[1].ended_at=data.ended_at
        result=sync_shift(self.db,1,data)
        self.assertEqual(sync_shift(self.db,1,data),result)
        self.assertEqual(self.db.query(ShiftSegment).count(),1)
        data.revision+=1; data.ended_at=None
        with self.assertRaises(HTTPException): sync_shift(self.db,1,data)
    def test_invalid_periods_and_links_rejected(self):
        for update in ({'ended_at':self.now-timedelta(seconds=1)}, {'started_at':'2026-09-28T00:00:00'}, {'planned_end_at':self.now-timedelta(hours=1)}):
            payload=self.data().model_dump(); payload.update(update)
            with self.assertRaises(ValidationError): ShiftSnapshot.model_validate(payload)
        payload=self.data().model_dump(); payload['segments']=[dict(client_id='s',started_at=self.now,distance_miles=1,category='business',platform_client_id='foreign')]
        with self.assertRaises(ValidationError): ShiftSnapshot.model_validate(payload)
    def test_atomic_failure(self):
        original=self.db.flush
        calls=0
        def fail(*args,**kwargs):
            nonlocal calls
            calls+=1
            if calls==3: raise RuntimeError('storage failure')
            return original(*args,**kwargs)
        with patch.object(self.db,'flush',side_effect=fail):
            with self.assertRaises(RuntimeError): sync_shift(self.db,1,self.data())
        self.assertEqual(self.db.query(Shift).count(),0)
    def test_inactive_owner_rejected(self):
        self.db.query(User).options(lazyload("*")).filter_by(id=1).one().is_active=False; self.db.commit()
        with self.assertRaises(HTTPException) as error: sync_shift(self.db,1,self.data())
        self.assertEqual(error.exception.status_code,401)
    def test_routes_enforce_authenticated_owner(self):
        from app.api.v1.endpoints.shift import router, get_db, get_current_user
        app=FastAPI(); app.include_router(router)
        app.dependency_overrides[get_db]=lambda:self.db
        app.dependency_overrides[get_current_user]=lambda:self.db.query(User).options(lazyload("*")).filter_by(id=1).one()
        with TestClient(app) as client:
            self.assertEqual(client.put('/shifts/shift-1',json=self.data().model_dump(mode='json')).status_code,200)
            self.assertEqual(client.get('/shifts/active').json()['client_id'],'shift-1')
            self.assertEqual(len(client.get('/shifts/').json()),1)
            app.dependency_overrides[get_current_user]=lambda:self.db.query(User).options(lazyload("*")).filter_by(id=2).one()
            self.assertEqual(client.get('/shifts/shift-1').status_code,404)
            self.assertIsNone(client.get('/shifts/active').json())
            self.assertEqual(client.put('/shifts/wrong',json=self.data().model_dump(mode='json')).status_code,422)
