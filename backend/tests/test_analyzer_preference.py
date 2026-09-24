import unittest
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.ext.compiler import compiles, deregister
from sqlalchemy.dialects.postgresql import JSONB
from app.models import User, Trip, Income, Expense, Subscription, TwoFactorAuth
from app.schemas.v1.user import UserUpdate
from app.services.user_service import update_user
from app.mappers.user_mapper import to_user_response

class AnalyzerPreferenceTests(unittest.TestCase):
    def test_existing_api_field_persists_in_canonical_column(self):
        # SQLite fixture only: production retains its PostgreSQL JSONB type.
        compiles(JSONB, "sqlite")(lambda element, compiler, **kw: "JSON")
        self.addCleanup(lambda: deregister(JSONB))
        engine = create_engine("sqlite://")
        for model in (User, Trip, Income, Expense, Subscription, TwoFactorAuth):
            model.__table__.create(engine)
        with Session(engine) as db:
            user = User(first_name="Test", last_name="User", email="test@example.com")
            db.add(user)
            db.commit()
            user_id = user.id
            update_user(db, user_id, UserUpdate(cost_per_mile=Decimal("0.42")))
        with Session(engine) as db:
            user = db.get(User, user_id)
            self.assertEqual(user.estimated_vehicle_cost_per_mile, Decimal("0.42"))
            self.assertEqual(to_user_response(user).cost_per_mile, Decimal("0.42"))
            self.assertNotIn("cost_per_mile", user.__dict__)
        engine.dispose()

if __name__ == "__main__":
    unittest.main()
