from datetime import date, datetime, timezone
from decimal import Decimal as D
from types import SimpleNamespace as N
import io
import unittest
from uuid import uuid4
from unittest.mock import patch
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, lazyload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, FastAPI
from fastapi.testclient import TestClient
from alembic.migration import MigrationContext
from alembic.operations import Operations
from app.models import User, Trip, Expense, Income
from app.models.enums import TripCategory, ExpenseCategory, TaxMethod
from app.models.vehicle import UserVehicle
from app.models.vehicle_tax import VehicleTaxSetting
from app.services.business_mileage import rate_for, deduction, money
from app.services.vehicle_reporting import summarize, report, export_rows, eligibility, owned_vehicle
from test_foundation_migrations import migration


def vehicle(identity='v'):
    return N(id=identity, year=2020, make='Test', model='Car', trim=None)
def trip(miles='10', day='2026-06-30T12:00:00+00:00', category=TripCategory.BUSINESS, vehicle_id='v'):
    return N(distance_miles=D(miles), start_time=datetime.fromisoformat(day), category=category, vehicle_id=vehicle_id)
def expense(amount='100', category=ExpenseCategory.FUEL, vehicle_id='v', percentage='100'):
    return N(amount=D(amount), category=category, vehicle_id=vehicle_id, business_percentage=D(percentage))
def setting(**kw):
    return N(**(dict(vehicle_id='v', method='actual_expenses', total_miles=D('1000'), business_miles=D('600'), ownership='owned',first_business_year=2026,first_method='standard_mileage',prior_method=None,section179=False,bonus_depreciation=False,accelerated_depreciation=False,fleet=False)|kw))

class CalculationTests(unittest.TestCase):
    def summary(self, trips=None, expenses=None, settings=None, method='standard_mileage'):
        return summarize(trips or [],expenses or [],[vehicle()],settings or [],method,2026)
    def test_2026_split_and_historical_rates(self):
        for day,rate in [('2026-06-30','.725'),('2026-07-01','.760'),('2025-12-31','.70'),('2022-06-30','.585'),('2022-07-01','.625'),('2011-06-30','.51'),('2011-07-01','.555')]:
            self.assertEqual(rate_for(date.fromisoformat(day)),D(rate))
        self.assertIsNone(rate_for(date(2027,1,1)))
        self.assertIsNone(rate_for(date(2009,1,1)))
    def test_local_midnight_rate_boundary(self):
        result=self.summary([trip(day='2026-07-01T01:00:00+00:00'),trip(day='2026-07-01T12:00:00+00:00')])
        self.assertEqual(result['total_deductions'],D('14.85'))
        self.assertEqual(len(result['rate_periods']),2)
    def test_personal_not_deducted_and_no_fuel_double_count(self):
        result=self.summary([trip(),trip(category=TripCategory.PERSONAL)], [expense(),expense('20',ExpenseCategory.PARKING_TOLLS),expense('40',ExpenseCategory.PHONE,percentage='50')])
        self.assertEqual(result['total_miles'],10);self.assertEqual(result['personal_miles'],10)
        self.assertEqual(result['total_expenses'],160)
        self.assertEqual(result['total_deductions'],D('47.25'))
    def test_actual_allocation_ignores_default_expense_100_percent(self):
        result=self.summary([trip()], [expense(),expense('20',ExpenseCategory.PARKING_TOLLS)], [setting()])
        self.assertEqual(result['total_deductions'],D('80'))
        self.assertEqual(result['vehicle_rows'][0]['business_use_percentage'],60)
        self.assertEqual(result['comparison_standard'],D('27.25'))
    def test_missing_total_is_incomplete_not_fabricated(self):
        result=self.summary([trip()], [expense()], method='actual_expenses')
        self.assertFalse(result['calculation_complete']);self.assertIsNone(result['comparison_actual'])
        self.assertEqual(result['total_deductions'],0)
        self.assertIsNone(result['vehicle_rows'][0]['actual'])
        without_purchases=self.summary([trip()],method='actual_expenses')
        self.assertFalse(without_purchases['calculation_complete'])
        self.assertIsNone(without_purchases['comparison_actual'])
    def test_recorded_business_cannot_exceed_documented_business(self):
        result=self.summary([trip('700')],[expense()],[setting()])
        self.assertFalse(result['calculation_complete'])
    def test_unassigned_history_not_defaulted(self):
        result=self.summary([trip(vehicle_id=None)],[expense(vehicle_id=None)],[setting()])
        unknown=next(r for r in result['vehicle_rows'] if r['vehicle_id'] is None)
        self.assertEqual(unknown['business_miles'],10);self.assertIsNone(unknown['actual'])
        self.assertEqual(result['vehicle_rows'][0]['business_miles'],0)
    def test_mixed_vehicle_methods_never_add_both(self):
        result=summarize([trip(),trip(vehicle_id='b')],[expense(),expense(vehicle_id='b')],[vehicle(),vehicle('b')],[setting(),setting(vehicle_id='b',method='standard_mileage')],'standard_mileage',2026)
        self.assertEqual(result['total_deductions'],D('67.25'))
        self.assertEqual(result['deductible_expense_total'],D('60'))
    def test_generic_vehicle_cost_not_assumed_operating(self):
        result=self.summary([], [expense('30000',ExpenseCategory.VEHICLE)],[setting()])
        self.assertFalse(result['calculation_complete']);self.assertEqual(result['total_deductions'],0)
    def test_rounding_decimal_half_up(self):
        self.assertEqual(money('1.005'),D('1.01'))
        self.assertEqual(deduction('.20',date(2026,1,1)),D('.15'))
        result=self.summary([trip('.20')]);self.assertEqual(result['total_deductions'],D('.15'))
    def test_unknown_and_restricted_eligibility(self):
        self.assertEqual(eligibility(None,2026),'unknown')
        self.assertEqual(eligibility(setting(ownership='leased',prior_method='actual_expenses'),2026),'restricted')
        for key in ['section179','bonus_depreciation','accelerated_depreciation','fleet']:
            self.assertEqual(eligibility(setting(**{key:True}),2026),'restricted')
        self.assertEqual(eligibility(setting(first_business_year=2020,first_method='actual_expenses'),2026),'restricted')
        self.assertEqual(eligibility(setting(),2026),'review_required')

class DatabaseReportingTests(unittest.TestCase):
    def setUp(self):
        self.engine=create_engine('sqlite://')
        for model in [User,UserVehicle,Trip,Expense,Income,VehicleTaxSetting]:model.__table__.create(self.engine)
        self.db=Session(self.engine,expire_on_commit=False)
        self.db.add_all([User(id=i,first_name='Test',last_name='User',email=f'{i}@example.test',timezone='America/New_York',tax_method=TaxMethod.STANDARD_MILEAGE) for i in (1,2)])
        self.db.commit();self.user=self.db.query(User).options(lazyload("*")).filter_by(id=1).one()
        for i in (1,2):self.db.add(UserVehicle(id=str(i),user_id=i,year=2020,make='Test',model='Car',fuel_type='gasoline',is_default=True,deleted=False,version=1,operation_id=str(uuid4())))
        self.db.commit()
    def tearDown(self):self.db.close();self.engine.dispose()
    def add_trip(self,owner=1,vehicle_id=None):
        t=Trip(user_id=owner,vehicle_id=vehicle_id,start_time=datetime(2026,7,1,1,tzinfo=timezone.utc),end_time=datetime(2026,7,1,2,tzinfo=timezone.utc),distance_miles=10,category=TripCategory.BUSINESS,deduction_amount=999)
        self.db.add(t);self.db.commit();return t
    def test_owner_filter_and_no_historical_assignment(self):
        self.add_trip();self.add_trip(2,'2')
        data=report(self.db,self.user,2026,advanced=True)
        self.assertEqual(data['total_miles'],10)
        self.assertEqual(data['total_deductions'],D('7.25'))
        self.assertIsNone(data['estimated_tax_owed'])
        self.assertEqual(self.db.query(Trip).filter_by(user_id=1).first().vehicle_id,None)
        with self.assertRaises(HTTPException):report(self.db,self.user,2026,vehicle_id='2',advanced=True)
    def test_filter_and_stable_fingerprint_changes_after_update(self):
        t=self.add_trip(vehicle_id='1')
        a=report(self.db,self.user,2026,vehicle_id='1',advanced=True)
        b=report(self.db,self.user,2026,vehicle_id='1',advanced=True)
        self.assertEqual(a['report_fingerprint'],b['report_fingerprint'])
        t.distance_miles=11;self.db.commit()
        self.assertNotEqual(a['report_fingerprint'],report(self.db,self.user,2026,vehicle_id='1',advanced=True)['report_fingerprint'])
        self.assertEqual(export_rows(a)[7][1],str(a['total_deductions']))
    def test_vehicle_income_uses_received_date_not_trip_date(self):
        from app.models.enums import IncomeType
        t=self.add_trip(vehicle_id='1')
        self.db.add(Income(user_id=1,trip_id=t.id,amount=D('50'),received_at=datetime(2026,7,5,12,tzinfo=timezone.utc),source=IncomeType.GIG_PLATFORM))
        self.db.commit()
        self.assertEqual(report(self.db,self.user,2026,month=7,vehicle_id='1',advanced=True)['total_income'],50)
    def test_legacy_period_filter_matches_local_calendar(self):
        from app.services.report_service import build_date_filters
        self.add_trip()
        june=self.db.query(Trip).filter(*build_date_filters(Trip.start_time,year=2026,month=6,timezone_name='America/New_York')).count()
        july=self.db.query(Trip).filter(*build_date_filters(Trip.start_time,year=2026,month=7,timezone_name='America/New_York')).count()
        self.assertEqual((june,july),(1,0))
    def test_tax_settings_and_vehicle_assignments_are_owner_scoped(self):
        from app.api.v1.endpoints.vehicle import put_tax_settings,TaxSettings
        from app.services.trip_service import create_trip,update_trip
        from app.schemas.v1.trip import TripCreate,TripUpdate
        with self.assertRaises(HTTPException) as error:
            put_tax_settings('2',2026,TaxSettings(),self.db,self.user)
        self.assertEqual(error.exception.status_code,404)
        payload=TripCreate(start_time='2026-06-30T12:00:00Z',end_time='2026-06-30T13:00:00Z',distance_miles=10,category='business',platform='uber',vehicle_id='2')
        with self.assertRaises(HTTPException):create_trip(self.db,payload,1)
        t=self.add_trip()
        update_trip(self.db,t.id,1,TripUpdate(vehicle_id='1'))
        self.assertEqual(t.vehicle_id,'1')
        with self.assertRaises(HTTPException):update_trip(self.db,t.id,1,TripUpdate(vehicle_id='2'))
        update_trip(self.db,t.id,1,TripUpdate(vehicle_id=None))
        self.assertIsNone(t.vehicle_id)

    def test_free_basic_context_advanced_comparison_hidden(self):
        self.add_trip(vehicle_id='1');result=report(self.db,self.user,2026)
        self.assertNotIn('comparison_standard',result);self.assertNotIn('business_miles',result['vehicle_rows'][0])
        self.assertEqual(result['trends'],[])
    def test_deleted_vehicle_history_preserved(self):
        self.add_trip(vehicle_id='1');self.db.get(UserVehicle,'1').deleted=True;self.db.commit()
        self.assertEqual(report(self.db,self.user,2026,vehicle_id='1',advanced=True)['total_miles'],10)
        with self.assertRaises(HTTPException):owned_vehicle(self.db,1,'1')
    def test_invalid_ranges_rejected(self):
        for kw in [dict(start_date=date(2026,1,1)),dict(start_date=date(2025,12,31),end_date=date(2026,1,1)),dict(month=13),dict(method='bad')]:
            with self.assertRaises(HTTPException):report(self.db,self.user,2026,**kw)
    def test_tax_schema_and_db_constraints(self):
        from app.api.v1.endpoints.vehicle import TaxSettings
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):TaxSettings(business_miles=10)
        self.db.add(VehicleTaxSetting(user_id=1,vehicle_id='1',year=2026,method='actual_expenses',business_miles=10,total_miles=None))
        with self.assertRaises(IntegrityError):self.db.commit()
        self.db.rollback()
    def test_trip_and_expense_old_schemas_accept_without_vehicle(self):
        from app.schemas.v1.trip import TripCreate,TripUpdate
        from app.schemas.v1.expense import ExpenseCreate
        t=TripCreate(start_time='2026-01-01T12:00:00Z',end_time='2026-01-01T13:00:00Z',distance_miles=10,category='business',platform='uber',start_address=None,end_address=None)
        self.assertIsNone(t.vehicle_id);self.assertEqual(TripUpdate(category='personal').model_dump(exclude_unset=True),{'category':TripCategory.PERSONAL})
        self.assertIsNone(ExpenseCreate(amount=10,category='fuel',incurred_at='2026-01-01T12:00:00Z',business_percentage=100).vehicle_id)
    def test_migration_upgrade_is_additive_and_downgrade_preserves_data(self):
        change=migration('ab27d384eb02_vehicle_reporting.py')
        self.assertEqual(change.down_revision,'fa16c273da91')
        separate=create_engine('sqlite://')
        with separate.begin() as c:
            c.execute(text('CREATE TABLE users (id INTEGER PRIMARY KEY)'))
            c.execute(text('CREATE TABLE user_vehicles (id VARCHAR(36) PRIMARY KEY)'))
            for table in ['trips','expenses']:
                c.execute(text(f'CREATE TABLE {table} (id INTEGER PRIMARY KEY, user_id INTEGER, amount NUMERIC)'))
                c.execute(text(f'INSERT INTO {table} (id,user_id,amount) VALUES (1,1,12.34)'))
            change.op=Operations(MigrationContext.configure(c));change.upgrade()
            self.assertIsNone(c.execute(text('SELECT vehicle_id FROM trips')).scalar())
            self.assertEqual(float(c.execute(text('SELECT amount FROM trips')).scalar()),12.34)
            c.execute(text("UPDATE trips SET vehicle_id='saved'"))
            with self.assertRaises(RuntimeError):change.downgrade()
            c.execute(text('UPDATE trips SET vehicle_id=NULL'));change.downgrade()
            self.assertEqual(c.execute(text('SELECT count(*) FROM trips')).scalar(),1)
        separate.dispose()
    def test_postgres_migration_ddl_no_data_rewrites(self):
        change=migration('ab27d384eb02_vehicle_reporting.py');output=io.StringIO()
        change.op=Operations(MigrationContext.configure(dialect_name='postgresql',opts={'as_sql':True,'output_buffer':output}));change.upgrade();sql=output.getvalue()
        self.assertIn('ON DELETE SET NULL',sql);self.assertIn('CREATE TABLE vehicle_tax_settings',sql)
        self.assertNotIn('UPDATE trips',sql);self.assertNotIn('DELETE FROM',sql)

class AccessExportTests(unittest.TestCase):
    def setUp(self):
        from app.api.v1.endpoints.report import router
        from app.api.dependencies.auth import get_current_user
        from app.api.dependencies.subscription import require_active_subscription
        from app.db.session import get_db
        self.app=FastAPI();self.app.include_router(router)
        self.app.dependency_overrides[get_current_user]=lambda:N(id=1)
        self.app.dependency_overrides[get_db]=lambda:None
        self.app.dependency_overrides[require_active_subscription]=lambda:N(id=1)
        self.client=TestClient(self.app)
    def test_free_cannot_access_new_advanced_filter_but_legacy_route_remains(self):
        with patch('app.services.subscription_service.has_active_subscription',return_value=False):
            self.assertEqual(self.client.get('/reports/vehicle-summary?vehicle_id=x').status_code,403)
        self.assertTrue(any(r.path=='/reports' or r.path=='/reports/' for r in self.app.routes))
    def test_export_entitlement(self):
        from app.api.dependencies.subscription import require_active_subscription
        def denied():raise HTTPException(403,'Premium required')
        self.app.dependency_overrides[require_active_subscription]=denied
        self.assertEqual(self.client.get('/reports/vehicle-exports/csv').status_code,403)
    def test_server_exports_same_rows_and_stale_fingerprint(self):
        summary=summarize([trip()],[expense()],[vehicle()],[],'standard_mileage',2026)
        summary.update(start_date=date(2026,1,1),end_date=date(2026,12,31),tax_method='standard_mileage',total_income=D(100),report_fingerprint='current')
        with patch('app.services.vehicle_reporting.report',return_value=summary):
            csv=self.client.get('/reports/vehicle-exports/csv?expected_fingerprint=current')
            self.assertEqual(csv.status_code,200);self.assertIn('7.25',csv.text);self.assertNotIn('receipt',csv.text)
            pdf=self.client.get('/reports/vehicle-exports/pdf?expected_fingerprint=current')
            self.assertEqual(pdf.status_code,200);self.assertTrue(pdf.content.startswith(b'%PDF'))
            self.assertEqual(self.client.get('/reports/vehicle-exports/pdf?expected_fingerprint=old').status_code,409)
