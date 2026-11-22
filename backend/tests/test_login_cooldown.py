from datetime import datetime, timedelta
from unittest import TestCase
from unittest.mock import patch

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.models.login_attempt import LoginAttempt
from app.services.login_cooldown_service import authenticate_with_cooldown


class LoginCooldownTests(TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        LoginAttempt.__table__.create(self.engine)
        self.db = Session(self.engine)
        self.now = datetime(2026, 11, 21, 12)
        self.auth = patch("app.services.login_cooldown_service.authenticate_user", return_value=(None, "invalid_credentials"))
        self.mock_auth = self.auth.start()
        self.addCleanup(self.auth.stop)
        self.addCleanup(self.engine.dispose)
        self.addCleanup(self.db.close)

    def attempt(self, email="driver@example.test", address="192.0.2.1", now=None):
        return authenticate_with_cooldown(self.db, email, "test-only-password", address, now or self.now)

    def block(self):
        for _ in range(4):
            self.assertEqual(self.attempt()[1], "invalid_credentials")
        with self.assertRaises(HTTPException) as error:
            self.attempt()
        self.assertEqual(error.exception.status_code, 429)
        self.assertEqual(error.exception.headers["Retry-After"], "900")

    def test_fifth_failure_blocks_and_retries_do_not_extend_wait(self):
        self.block()
        with self.assertRaises(HTTPException) as error:
            self.attempt(now=self.now + timedelta(minutes=2))
        self.assertEqual(error.exception.headers["Retry-After"], "780")
        self.assertEqual(self.mock_auth.call_count, 5)

    def test_expiry_allows_retry_and_survives_new_database_session(self):
        self.block()
        self.db.close()
        self.db = Session(self.engine)
        with self.assertRaises(HTTPException):
            self.attempt()
        self.assertEqual(self.attempt(now=self.now + timedelta(minutes=15))[1], "invalid_credentials")

    def test_success_clears_pair_and_preserves_response(self):
        for _ in range(4):
            self.attempt()
        user = object()
        self.mock_auth.return_value = (user, "success")
        self.assertEqual(self.attempt(), (user, "success"))
        self.mock_auth.return_value = (None, "invalid_credentials")
        for _ in range(4):
            self.assertEqual(self.attempt()[1], "invalid_credentials")

    def test_cannot_lock_same_account_across_networks_or_other_accounts(self):
        self.block()
        self.assertEqual(self.attempt(address="192.0.2.2")[1], "invalid_credentials")
        self.assertEqual(self.attempt(email="other@example.test")[1], "invalid_credentials")

    def test_network_limit_and_private_storage(self):
        for i in range(49):
            self.attempt(email=f"driver{i}@example.test", address="8.8.8.8")
        with self.assertRaises(HTTPException):
            self.attempt(email="last@example.test", address="8.8.8.8")
        for row in self.db.query(LoginAttempt):
            self.assertEqual(len(row.key), 64)
            self.assertNotIn("example", row.key)

    def test_mixed_case_email_shares_cooldown(self):
        self.block()
        with self.assertRaises(HTTPException):
            self.attempt(email="Driver@Example.Test")

    def test_shared_private_proxy_does_not_lock_all_accounts(self):
        for i in range(55):
            self.assertEqual(self.attempt(email=f"driver{i}@example.test", address="172.18.0.1")[1], "invalid_credentials")
