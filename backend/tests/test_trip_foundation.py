"""Isolated in-memory service tests; never connect to the application database."""
import unittest
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import patch
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models import Trip, Income, User, AnalyticsEvent, Expense, TaxBracket
from app.schemas.v1.trip import TripCreate, TripUpdate, TripResponse
from app.schemas.v1.income import IncomeResponse
from app.models.enums import FilingStatus, TaxMethod
from app.services.report_service import generate_tax_report
from app.services.trip_service import create_trip, update_trip, get_trips_for_user

class TripFoundationTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        for model in (User, Trip, Income, AnalyticsEvent, Expense, TaxBracket):
            model.__table__.create(self.engine)
        self.db = Session(self.engine, expire_on_commit=False)
        self.rate = patch("app.services.trip_service.get_business_rate_for_date")
        self.rate.start().return_value.business_rate = Decimal("0.70")
    def tearDown(self):
        self.rate.stop()
        self.db.close()
        self.engine.dispose()
    def payload(self, **changes):
        values = dict(client_id="local-trip-1", start_time=datetime(2026, 1, 1, tzinfo=timezone.utc),
            end_time=datetime(2026, 1, 1, 1, tzinfo=timezone.utc), distance_miles="12.34",
            start_lat="40", start_lng="-74", end_lat="40.1", end_lng="-74.1",
            category="business", platform="uber", income_amount="25")
        return TripCreate(**(values | changes))
    def test_first_creation_and_repeated_response_loss_retry(self):
        first = create_trip(self.db, self.payload(), 1)
        self.db.close()
        self.db = Session(self.engine, expire_on_commit=False)
        for _ in range(3):
            self.assertEqual(create_trip(self.db, self.payload(), 1).id, first.id)
        for model in (Trip, Income, AnalyticsEvent):
            self.assertEqual(self.db.query(model).count(), 1)
    def test_identity_is_owner_scoped(self):
        a = create_trip(self.db, self.payload(), 1)
        b = create_trip(self.db, self.payload(), 2)
        self.assertNotEqual(a.id, b.id)
        self.assertEqual(b.user_id, 2)
    def test_conflicting_identity_does_not_overwrite(self):
        first = create_trip(self.db, self.payload(), 1)
        for changes in ({"distance_miles": "15"}, {"income_amount": "30"}, {"category": "personal"}):
            with self.assertRaises(HTTPException) as caught:
                create_trip(self.db, self.payload(**changes), 1)
            self.assertEqual(caught.exception.status_code, 409)
        self.assertEqual(first.distance_miles, Decimal("12.34"))
        self.assertEqual(self.db.query(Income).one().amount, Decimal("25"))
    def test_old_client_without_identity_and_without_income(self):
        trip = create_trip(self.db, self.payload(client_id=None, income_amount=None), 1)
        self.assertIsNone(trip.client_id)
        self.assertEqual(self.db.query(Income).count(), 0)
    def test_null_addresses_and_changed_retry_enrichment(self):
        trip = create_trip(self.db, self.payload(), 1)
        self.assertIsNone(trip.start_address)
        self.assertIsNone(trip.end_address)
        self.assertEqual(create_trip(self.db, self.payload(start_address="Enriched later"), 1).id, trip.id)
    def test_income_failure_rolls_back_trip_and_allows_retry(self):
        with self.assertRaises(HTTPException):
            create_trip(self.db, self.payload(income_amount="-1"), 1)
        self.assertEqual(self.db.query(Trip).count(), 0)
        self.assertEqual(self.db.query(Income).count(), 0)
        create_trip(self.db, self.payload(), 1)
        self.assertEqual(self.db.query(Trip).count(), 1)
        self.assertEqual(self.db.query(Income).count(), 1)
    def test_failure_after_income_flush_rolls_back_both(self):
        with patch.object(self.db, "commit", side_effect=RuntimeError("simulated failure")):
            with self.assertRaises(RuntimeError):
                create_trip(self.db, self.payload(), 1)
        self.assertEqual(self.db.query(Trip).count(), 0)
        self.assertEqual(self.db.query(Income).count(), 0)
    def test_personal_creation_and_reclassification(self):
        trip = create_trip(self.db, self.payload(category="personal", income_amount=None), 1)
        self.assertEqual(trip.deduction_amount, 0)
        update_trip(self.db, trip.id, 1, TripUpdate(category="business"))
        self.assertEqual(trip.deduction_amount, Decimal("8.64"))
        update_trip(self.db, trip.id, 1, TripUpdate(category="personal"))
        self.assertEqual(trip.deduction_amount, 0)
        self.assertEqual(trip.distance_miles, Decimal("12.34"))
    def test_update_income_atomic_and_response_contracts(self):
        trip = create_trip(self.db, self.payload(), 1)
        with self.assertRaises(HTTPException):
            update_trip(self.db, trip.id, 1, TripUpdate(category="personal", income_amount=-1))
        self.db.refresh(trip)
        self.assertEqual(trip.category.value, "business")
        update_trip(self.db, trip.id, 1, TripUpdate(income_amount=30))
        self.assertEqual(TripResponse.model_validate(trip).income_amount, Decimal("30"))
        self.assertEqual(IncomeResponse.model_validate(trip.income).trip_id, trip.id)
        update_trip(self.db, trip.id, 1, TripUpdate(income_amount=None))
        self.assertIsNone(TripResponse.model_validate(trip).income_amount)
    def test_report_excludes_historical_personal_deduction_but_history_keeps_trip(self):
        from types import SimpleNamespace
        business = create_trip(self.db, self.payload(), 1)
        personal = create_trip(self.db, self.payload(client_id="personal", category="personal", income_amount=None,
            start_time=datetime(2026, 1, 2, tzinfo=timezone.utc)), 1)
        personal.deduction_amount = Decimal("500")
        self.db.add(TaxBracket(year=2026, filing_status=FilingStatus.single, min_income=0, rate=Decimal("0.1")))
        self.db.commit()
        user = SimpleNamespace(id=1, timezone="UTC", filing_status=FilingStatus.single,
            tax_method=TaxMethod.STANDARD_MILEAGE, business_type=None)
        report = generate_tax_report(self.db, user, year=2026)
        self.assertEqual(report["total_miles"], business.distance_miles)
        self.assertEqual(report["mileage_deduction"], business.deduction_amount)
        self.assertEqual(len(get_trips_for_user(self.db, 1)), 2)

    def test_unique_race_recovers_existing_creation(self):
        from app.services import trip_service
        trip = create_trip(self.db, self.payload(), 1)
        original = trip_service._existing_creation
        calls = 0
        def lookup(*args):
            nonlocal calls
            calls += 1
            return None if calls == 1 else original(*args)
        with patch.object(trip_service, "_existing_creation", side_effect=lookup):
            self.assertEqual(create_trip(self.db, self.payload(), 1).id, trip.id)
        self.assertEqual(self.db.query(Trip).count(), 1)
        self.assertEqual(self.db.query(Income).count(), 1)

if __name__ == "__main__":
    unittest.main()
