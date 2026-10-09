import unittest
from uuid import uuid4
from unittest.mock import patch
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError
from app.models import User
from app.models.vehicle import UserVehicle
from app.schemas.v1.vehicle import VehicleWrite
from app.services.vehicle_service import save_vehicle
from app.services import vehicle_lookup, fuel_price_service
from test_foundation_migrations import migration
from alembic.migration import MigrationContext
from alembic.operations import Operations

class VehicleTests(unittest.TestCase):
    def setUp(self):
        self.engine=create_engine('sqlite://')
        @event.listens_for(self.engine, 'connect')
        def fk(c, _): c.execute('PRAGMA foreign_keys=ON')
        User.__table__.create(self.engine)
        UserVehicle.__table__.create(self.engine)
        self.db=Session(self.engine)
        self.db.add_all([User(id=i, first_name='Test', last_name='User',email=f'{i}@example.test') for i in (1,2)])
        self.db.commit()
    def tearDown(self): self.db.close(); self.engine.dispose()
    def data(self, **kw):
        return VehicleWrite(**(dict(year=2020,make='Test',model='Car',fuel_type='gasoline',custom_mpg=25,
            expected_version=0,operation_id=uuid4()) | kw))
    def test_create_retry_edit_delete_and_tombstone(self):
        identity=str(uuid4()); data=self.data()
        a=save_vehicle(self.db,1,identity,data)
        self.assertEqual(save_vehicle(self.db,1,identity,data).version,1)
        a=save_vehicle(self.db,1,identity,self.data(expected_version=1,custom_mpg=30))
        self.assertEqual(a.custom_mpg,30)
        with self.assertRaises(HTTPException): save_vehicle(self.db,1,identity,self.data(expected_version=1))
        deletion=self.data(expected_version=2,deleted=True)
        self.assertTrue(save_vehicle(self.db,1,identity,deletion).deleted)
        self.assertEqual(save_vehicle(self.db,1,identity,deletion).version,3)
        with self.assertRaises(HTTPException): save_vehicle(self.db,1,identity,self.data(expected_version=3))
        self.assertEqual(self.db.query(UserVehicle).count(),1)
    def test_owner_isolation_and_default(self):
        a=str(uuid4()); b=str(uuid4())
        save_vehicle(self.db,1,a,self.data(is_default=True))
        save_vehicle(self.db,1,b,self.data(is_default=True))
        self.db.expire_all()
        self.assertFalse(self.db.get(UserVehicle,a).is_default)
        self.assertTrue(self.db.get(UserVehicle,b).is_default)
        with self.assertRaises(HTTPException): save_vehicle(self.db,2,a,self.data())
        save_vehicle(self.db,2,str(uuid4()),self.data(is_default=True))
        self.assertEqual(self.db.query(UserVehicle).filter_by(user_id=1).count(),2)
    def test_db_constraint_and_account_cascade(self):
        save_vehicle(self.db,1,str(uuid4()),self.data(is_default=True))
        with self.assertRaises(IntegrityError):
            self.db.execute(text("INSERT INTO user_vehicles (id,user_id,year,make,model,fuel_type,is_default,deleted,version,operation_id) VALUES ('x',1,2020,'a','b','gasoline',1,0,1,'x')"))
        self.db.rollback()
        self.db.execute(text('DELETE FROM users WHERE id=1'));self.db.commit()
        self.assertEqual(self.db.query(UserVehicle).count(),0)
    def test_validation(self):
        for data in [dict(custom_mpg=0),dict(custom_mpg=float('nan')),dict(year=0),dict(make=' '),dict(fuel_type='hydrogen')]:
            with self.assertRaises(ValidationError): self.data(**data)
    def test_migration_upgrade_preserves_existing_user(self):
        UserVehicle.__table__.drop(self.engine)
        change=migration('ef05b162c980_user_vehicles.py')
        self.assertEqual(change.down_revision,'de94a051b879')
        with self.engine.begin() as c:
            change.op=Operations(MigrationContext.configure(c));change.upgrade()
        save_vehicle(self.db,1,str(uuid4()),self.data())
        self.assertEqual(self.db.execute(text('SELECT count(*) FROM users')).scalar(),2)
        with self.engine.begin() as c:
            change.op=Operations(MigrationContext.configure(c))
            with self.assertRaises(RuntimeError): change.downgrade()
    def test_epa_ev_is_kwh_not_mpge_and_dual_fuel_manual(self):
        data=dict(year='2020',make='Test',model='EV',fuelType1='Electricity',comb08=120,combE=28)
        with patch.object(vehicle_lookup,'fetch',return_value=data):
            v=vehicle_lookup.vehicle(1)
            self.assertIsNone(v['combined_mpg']);self.assertEqual(v['kwh_per_100_miles'],28)
        data.update(fuelType1='Regular Gasoline',fuelType2='Electricity')
        with patch.object(vehicle_lookup,'fetch',return_value=data):
            self.assertEqual(vehicle_lookup.vehicle(1)['fuel_type'],'other')
    def test_price_unavailable_failure_stale_and_valid(self):
        self.assertEqual(fuel_price_service.local_price('30301','gasoline')['status'],'unavailable')
        from types import SimpleNamespace
        quote=fuel_price_service.FuelQuote(price=3.2,unit='USD/US-gallon',fuel_type='gasoline',source='Test provider',location='Test area',observed_at=datetime.now(timezone.utc)-timedelta(hours=1))
        with patch.object(fuel_price_service,'provider',SimpleNamespace(lookup=lambda *a:quote)):
            self.assertEqual(fuel_price_service.local_price('30301','gasoline')['status'],'available')
            quote.observed_at-=timedelta(days=2)
            self.assertEqual(fuel_price_service.local_price('30301','gasoline')['status'],'unavailable')
        with patch.object(fuel_price_service,'provider',SimpleNamespace(lookup=lambda *a:1/0)):
            self.assertEqual(fuel_price_service.local_price('30301','gasoline')['status'],'unavailable')
    def test_inactive_owner_cannot_write(self):
        self.db.execute(text('UPDATE users SET is_active=0 WHERE id=1'));self.db.commit()
        with self.assertRaises(HTTPException) as error: save_vehicle(self.db,1,str(uuid4()),self.data())
        self.assertEqual(error.exception.status_code,401)
    def test_list_api_filters_owner(self):
        from app.api.v1.endpoints.vehicle import list_vehicles
        from types import SimpleNamespace
        a=save_vehicle(self.db,1,str(uuid4()),self.data())
        save_vehicle(self.db,2,str(uuid4()),self.data())
        self.assertEqual([v.id for v in list_vehicles(self.db,SimpleNamespace(id=1))],[a.id])
    def test_postgres_migration_is_additive(self):
        import io
        output=io.StringIO()
        change=migration('ef05b162c980_user_vehicles.py')
        change.op=Operations(MigrationContext.configure(dialect_name='postgresql',opts={'as_sql':True,'output_buffer':output}))
        change.upgrade();sql=output.getvalue()
        self.assertIn('CREATE TABLE user_vehicles',sql)
        self.assertIn('WHERE is_default AND NOT deleted',sql)
        self.assertIn('ON DELETE CASCADE',sql)
        self.assertNotIn('ALTER TABLE users',sql)
        self.assertNotIn('DELETE FROM',sql)
    def test_price_route_requires_existing_subscription_dependency(self):
        from app.api.v1.endpoints.vehicle import router
        from app.api.dependencies.subscription import require_active_subscription
        app=FastAPI();app.include_router(router)
        def denied(): raise HTTPException(403,'Premium subscription required')
        app.dependency_overrides[require_active_subscription]=denied
        self.assertEqual(TestClient(app).get('/vehicles/fuel-price?postal_code=30301').status_code,403)

if __name__=='__main__': unittest.main()
