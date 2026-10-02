"""Opt-in real PostgreSQL coverage, restricted to a disposable Unix-socket cluster."""
import importlib.util
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Barrier
import unittest
from sqlalchemy import create_engine, inspect
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session
from alembic.migration import MigrationContext
from alembic.operations import Operations
from fastapi import HTTPException
from app.models import User, Trip, Shift, ShiftSegment
from app.schemas.v1.shift import ShiftSnapshot
from app.services.shift_service import sync_shift

URL = os.environ.get('DEDUCKLY_SHIFT_TEST_POSTGRES')

@unittest.skipUnless(URL, 'Disposable PostgreSQL URL not supplied')
class ShiftPostgresTests(unittest.TestCase):
    def test_migrations_concurrent_retries_and_active_owner_lock(self):
        url = make_url(URL)
        host = str(url.query.get('host', ''))
        if url.host or not host.startswith('/private/tmp/deduckly-shift-pg-'):
            self.fail('Refusing any PostgreSQL target except a disposable Shift Unix-socket cluster')
        engine = create_engine(url)
        try:
            User.__table__.create(engine)
            Trip.__table__.create(engine)
            changes = []
            for name in ('ab61d728e546_shift_foundation.py', 'bc72e839f657_shift_sync.py', 'cd83f940a768_shift_trip_conversion.py', 'de94a051b879_shift_segment_endpoints.py'):
                path = Path(__file__).resolve().parents[1]/'alembic/versions'/name
                spec = importlib.util.spec_from_file_location(name,path)
                module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
                changes.append(module)
            with engine.begin() as connection:
                for change in changes:
                    change.op = Operations(MigrationContext.configure(connection)); change.upgrade()
            with Session(engine) as db:
                db.add(User(id=1, first_name='Test', last_name='User', email='pg@example.com')); db.commit()
            def payload(client_id):
                return ShiftSnapshot(client_id=client_id,revision=1,started_at='2026-09-28T08:00:00Z')
            def concurrent(ids):
                barrier = Barrier(2)
                def run(client_id):
                    with Session(engine) as db:
                        barrier.wait()
                        try: return sync_shift(db,1,payload(client_id)).client_id
                        except HTTPException as error: return error.status_code
                with ThreadPoolExecutor(max_workers=2) as pool: return list(pool.map(run,ids))
            self.assertEqual(concurrent(['same','same']),['same','same'])
            self.assertEqual(concurrent(['other-a','other-b']),[409,409])
            with Session(engine) as db:
                self.assertEqual(db.query(Shift).count(),1)
                ended=payload('same'); ended.revision=2
                from datetime import datetime, timezone
                ended.ended_at=datetime(2026,9,28,9,tzinfo=timezone.utc)
                sync_shift(db,1,ended)
            results=concurrent(['new-a','new-b'])
            self.assertEqual(results.count(409),1)
            self.assertEqual(sum(isinstance(value,str) for value in results),1)
            # Manual save and midnight catch-up compete for the same owner lock.
            from unittest.mock import patch
            from decimal import Decimal
            from app.services.shift_conversion_service import convert_pending
            with Session(engine) as db:
                data = db.query(Shift).filter_by(client_id='same').one()
                from app.services.shift_service import snapshot
                update = snapshot(data); update.revision += 1
                from app.schemas.v1.shift import Segment
                update.segments.append(Segment(client_id='drive', started_at=update.started_at, ended_at=update.ended_at, distance_miles=5, category='business', save_requested=True))
                sync_shift(db, 1, update)
            barrier=Barrier(2)
            def convert(_):
                with Session(engine) as db:
                    barrier.wait()
                    return convert_pending(db,1)
            with patch('app.services.shift_conversion_service._trip_deduction', return_value=Decimal('3.50')):
                with ThreadPoolExecutor(max_workers=2) as pool: results=list(pool.map(convert,range(2)))
            self.assertEqual(sum(len(r['created_trip_ids']) for r in results),1)
            with Session(engine) as db:
                self.assertEqual(db.query(Trip).count(),1)
                self.assertEqual(db.query(Trip).one().distance_miles,Decimal('5.00'))
                db.query(ShiftSegment).delete(); db.query(Trip).delete(); db.commit()
            with engine.begin() as connection:
                for change in reversed(changes):
                    change.op=Operations(MigrationContext.configure(connection)); change.downgrade()
                self.assertEqual(sorted(inspect(connection).get_table_names()),['trips','users'])
        finally: engine.dispose()
