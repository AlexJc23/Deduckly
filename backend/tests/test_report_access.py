import unittest
from datetime import date
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.ext.compiler import compiles, deregister
from sqlalchemy.dialects.postgresql import JSONB
from app.models import User, Trip, Income, Expense
from app.models.enums import IncomeType
from app.services.report_access import allowed_period, monthly_comparison

class ReportAccessTests(unittest.TestCase):
    def setUp(self):
        self.user = SimpleNamespace(id=1, timezone='America/New_York')
        clock = patch('app.services.report_access.local_today', return_value=date(2026, 1, 10))
        clock.start(); self.addCleanup(clock.stop)

    def test_free_defaults_to_current_calendar_month(self):
        self.assertEqual(allowed_period(self.user, False), (2026, 1))
        self.assertEqual(allowed_period(self.user, False, 2026, 1), (2026, 1))

    def test_free_cannot_request_history_or_other_report_modes(self):
        for kwargs in [dict(year=2025,month=12),dict(year=2026),dict(month=1),dict(year=2027,month=1),dict(day=1),dict(start_date=date(2026,1,1)),dict(vehicle_id='vehicle')]:
            with self.subTest(kwargs=kwargs), self.assertRaises(HTTPException) as error:
                allowed_period(self.user, False, **kwargs)
            self.assertEqual(error.exception.status_code, 403)

    def test_premium_keeps_historical_periods(self):
        self.assertEqual(allowed_period(self.user, True, 2025, 12), (2025,12))
        self.assertEqual(allowed_period(self.user, True, 2025), (2025,None))

    def test_previous_month_totals_cross_year_and_exclude_other_accounts(self):
        from datetime import datetime, timezone
        compiles(JSONB, 'sqlite')(lambda element, compiler, **kw: 'JSON')
        self.addCleanup(lambda: deregister(JSONB))
        engine = create_engine('sqlite://')
        self.addCleanup(engine.dispose)
        for model in (User, Trip, Income, Expense): model.__table__.create(engine)
        with Session(engine) as db:
            # Do not load ORM User relationships; only owned activity is queried.
            for uid, value, at in [(1,100,'2025-12-15T12:00:00'),(2,999,'2025-12-15T12:00:00'),(1,50,'2026-01-10T12:00:00')]:
                db.add(Income(user_id=uid,source=IncomeType.OTHER,amount=Decimal(value),received_at=datetime.fromisoformat(at).replace(tzinfo=timezone.utc)))
            db.commit()
            result=monthly_comparison(db,self.user,2026,1)
            self.assertEqual((result['year'],result['month']),(2025,12))
            self.assertEqual(result['total_income'],100)
            self.assertEqual(result['total_expenses'],0)
            self.assertEqual(result['total_miles'],0)

if __name__=='__main__': unittest.main()
