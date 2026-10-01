import importlib.util
from pathlib import Path
import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, lazyload
from alembic.migration import MigrationContext
from alembic.operations import Operations
from app.models import User, NotificationOccurrence
from app.models.session import Session as AuthSession
from app.services.auth_services import logout_user
from fastapi import HTTPException
from app.services.push_registration_service import register_push_token, unregister_push_token
from app.services.goal_reminder_service import check_goal_reminder, check_notification_receipts

class PushOwnershipTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        User.__table__.create(self.engine)
        NotificationOccurrence.__table__.create(self.engine)
        AuthSession.__table__.create(self.engine)
        self.db = Session(self.engine, expire_on_commit=False)
        self.a = User(id=1, first_name="A", last_name="Test", email="a@example.com", timezone="UTC")
        self.b = User(id=2, first_name="B", last_name="Test", email="b@example.com", timezone="UTC")
        self.db.add_all([self.a, self.b]); self.db.commit()
        self.now = datetime(2026, 9, 2, 8, tzinfo=timezone.utc)
    def tearDown(self):
        self.db.close(); self.engine.dispose()
    async def test_a_then_b_owns_token_and_only_b_receives(self):
        register_push_token(self.db, 1, "token-X")
        with patch("app.services.goal_reminder_service.send_push_notification", new_callable=AsyncMock) as send:
            send.return_value = {"data": {"status": "ok", "id": "ticket"}}
            await check_goal_reminder(self.db, self.a, self.now)
            self.assertEqual(send.await_count, 1)
            register_push_token(self.db, 2, "token-X")
            self.assertIsNone(self.a.expo_push_token)
            self.assertEqual(self.b.expo_push_token, "token-X")
            await check_goal_reminder(self.db, self.a, self.now.replace(day=3))
            self.assertEqual(send.await_count, 1)
            await check_goal_reminder(self.db, self.b, self.now)
            self.assertEqual(send.await_count, 2)
    def test_logout_relogin_and_single_destination_model(self):
        register_push_token(self.db, 1, "X")
        register_push_token(self.db, 1, "X")
        register_push_token(self.db, 1, "Y")
        unregister_push_token(self.db, 1, "X"); self.db.commit()
        self.assertEqual(self.a.expo_push_token, "Y")
        unregister_push_token(self.db, 1, "Y"); self.db.commit()
        self.assertIsNone(self.a.expo_push_token)
        self.assertTrue(self.a.notifications_enabled)
        register_push_token(self.db, 1, "Y")
        self.assertEqual(self.a.expo_push_token, "Y")
        register_push_token(self.db, 2, "Y")
        unregister_push_token(self.db, 1, "Y"); self.db.commit()
        self.assertEqual(self.b.expo_push_token, "Y")
    def test_real_logout_service_revokes_session_and_its_destination(self):
        register_push_token(self.db, 1, "X")
        session = AuthSession(user_id=1, refresh_token="test-refresh", expires_at=self.now)
        self.db.add(session); self.db.commit()
        logout_user(self.db, "test-refresh", "X")
        self.assertTrue(session.is_revoked)
        self.assertIsNone(self.a.expo_push_token)
        self.assertEqual(logout_user(self.db, "test-refresh", "X")["message"], "Already logged out")
        with self.assertRaises(HTTPException) as failure:
            logout_user(self.db, "missing", "X")
        self.assertEqual(failure.exception.status_code, 404)

    async def test_stale_scanned_user_cannot_send_to_reassigned_token(self):
        register_push_token(self.db, 1, "X")
        # Preserve the scheduler's stale instance while another session reassigns.
        with Session(self.engine) as other:
            register_push_token(other, 2, "X")
        with patch("app.services.goal_reminder_service.send_push_notification", new_callable=AsyncMock) as send:
            await check_goal_reminder(self.db, self.a, self.now)
            send.assert_not_awaited()
        self.assertEqual(self.db.query(NotificationOccurrence).one().status, "skipped")
    async def test_old_receipt_never_clears_new_owner(self):
        register_push_token(self.db, 2, "X")
        self.db.add(NotificationOccurrence(user_id=1, kind="daily_8", period="2026-09-02",
            claimed_at=self.now, status="accepted", ticket_id="old", push_token="X"))
        self.db.commit()
        with patch("app.services.goal_reminder_service.get_push_receipts", new_callable=AsyncMock) as receipts:
            receipts.return_value = {"old": {"status": "error", "details": {"error": "DeviceNotRegistered"}}}
            await check_notification_receipts(self.db, self.now.replace(minute=16))
        self.db.refresh(self.b, ["expo_push_token"])
        self.assertEqual(self.b.expo_push_token, "X")
    def test_unique_constraint_and_multiple_nulls(self):
        self.a.expo_push_token = "X"; self.b.expo_push_token = "X"
        with self.assertRaises(IntegrityError): self.db.commit()
        self.db.rollback()
    def test_migration_clears_ambiguous_destinations_without_guessing(self):
        file = Path(__file__).resolve().parents[1]/"alembic/versions/fa50c617d435_push_token_ownership.py"
        spec=importlib.util.spec_from_file_location("push_migration", file)
        migration=importlib.util.module_from_spec(spec); spec.loader.exec_module(migration)
        engine=create_engine("sqlite://")
        with engine.begin() as connection:
            connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, expo_push_token TEXT, notifications_enabled BOOLEAN)"))
            connection.execute(text("INSERT INTO users VALUES (1,'X',1),(2,'X',1),(3,'Y',1),(4,NULL,0)"))
            migration.op=Operations(MigrationContext.configure(connection)); migration.upgrade()
            rows=connection.execute(text("SELECT * FROM users ORDER BY id")).all()
            self.assertEqual(rows, [(1,None,1),(2,None,1),(3,'Y',1),(4,None,0)])
            migration.downgrade()
        engine.dispose()

if __name__ == "__main__": unittest.main()
