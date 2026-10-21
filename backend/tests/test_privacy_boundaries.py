"""Synthetic privacy regressions: no external services or application database."""
import unittest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from app.models.enums import UserRole
from app.schemas.v1.user import UserCreate
from app.services import user_service, storage_service

class PrivacyBoundaryTests(unittest.TestCase):
    def test_public_registration_never_assigns_admin(self):
        db = Mock()
        for role in (UserRole.ADMIN, UserRole.USER, None):
            with patch.object(user_service, "get_user_by_email", return_value=None), patch.object(user_service, "hash_password", return_value="synthetic-hash"):
                user = user_service.create_user(db, UserCreate(first_name="Test", last_name="User", email="test@example.com", password="Synthetic123", role=role))
            self.assertEqual(user.role, UserRole.USER)

    def test_receipt_signing_and_deletion_are_owner_scoped(self):
        host = "test-bucket.s3.us-east-1.amazonaws.com"
        with patch.object(storage_service.settings, "s3_bucket", "test-bucket"), patch.object(storage_service.settings, "aws_region", "us-east-1"), patch.object(storage_service, "get_s3_client") as client:
            for url in (f"https://{host}/2/receipt.jpg", f"https://{host}/10/receipt.jpg", f"https://{host}/1/../2/receipt.jpg", f"https://{host}/1/%2e%2e/2/receipt.jpg", f"https://{host}/%2532/receipt.jpg", f"https://{host}.evil.example/1/r.jpg", f"https://{host}@evil.example/1/r.jpg"):
                for operation in (storage_service.generate_presigned_url, storage_service.delete_file_from_s3):
                    with self.subTest(url=url, operation=operation.__name__):
                        with self.assertRaises(HTTPException): operation(url, user_id=1)
            client.assert_not_called()
            own = f"https://{host}/1/receipt.jpg?X-Amz-Signature=synthetic"
            storage_service.generate_presigned_url(own, user_id=1)
            self.assertEqual(client.return_value.generate_presigned_url.call_args.kwargs["Params"]["Key"], "1/receipt.jpg")
            storage_service.delete_file_from_s3(own, user_id=1)
            self.assertEqual(client.return_value.delete_object.call_args.kwargs["Key"], "1/receipt.jpg")
            self.assertIsNone(storage_service.generate_presigned_url(None, user_id=1))

    def test_expense_create_and_update_reject_unowned_receipts_before_mutation(self):
        from types import SimpleNamespace
        from decimal import Decimal
        from app.schemas.v1.expense import ExpenseCreate, ExpenseUpdate
        from app.services import expense_service
        url = "https://test-bucket.s3.us-east-1.amazonaws.com/2/receipt.jpg"
        db = Mock()
        with patch.object(storage_service.settings, "s3_bucket", "test-bucket"), patch.object(storage_service.settings, "aws_region", "us-east-1"):
            with self.assertRaises(HTTPException): expense_service.create_expense(db, ExpenseCreate(amount=10, category="fuel", incurred_at="2026-01-01T00:00:00Z", receipt_url=url), 1, "UTC")
            db.add.assert_not_called()
            expense = SimpleNamespace(amount=Decimal("5"), receipt_url=None)
            with patch.object(expense_service, "get_expense", return_value=expense):
                with self.assertRaises(HTTPException): expense_service.update_expense(db, 1, ExpenseUpdate(amount=99, receipt_url=url), 1, "UTC")
            self.assertEqual(expense.amount, Decimal("5")); db.commit.assert_not_called()

class CredentialBoundaryTests(unittest.TestCase):
    def setUp(self):
        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session
        from app.models import User, TwoFactorAuth, Session as AuthSession
        from app.models.password_reset import PasswordResetToken
        self.engine = create_engine("sqlite://")
        for model in (User, TwoFactorAuth, AuthSession, PasswordResetToken): model.__table__.create(self.engine)
        self.db = Session(self.engine, expire_on_commit=False)
        self.user = User(id=1, first_name="Synthetic", last_name="User", email="synthetic@example.com", hashed_password="original")
        self.db.add(self.user); self.db.commit()
    def tearDown(self): self.db.close(); self.engine.dispose()

    def test_profile_cannot_change_credentials_or_partial_profile(self):
        from app.schemas.v1.user import UserUpdate
        with patch.object(user_service, "get_user", return_value=self.user), patch.object(self.db, "refresh"):
            with self.assertRaises(HTTPException): user_service.update_user(self.db, 1, UserUpdate(password="Other1234", first_name="Changed"))
            self.assertEqual(self.user.hashed_password, "original")
            self.assertEqual(self.user.first_name, "Synthetic")
            user_service.update_user(self.db, 1, UserUpdate(first_name="Allowed"))
            self.assertEqual(self.user.first_name, "Allowed")

    def test_enabled_totp_secret_is_not_returned_and_disable_needs_code(self):
        import pyotp
        from app.models import TwoFactorAuth
        from app.services.auth_services import generate_2fa_secret
        from app.api.v1.endpoints.auth import disable_2fa
        from app.schemas.v1.auth import Disable2FARequest
        setup = generate_2fa_secret(self.db, self.user)
        self.assertEqual(generate_2fa_secret(self.db, self.user), setup)
        record = self.db.query(TwoFactorAuth).one(); record.is_enabled = True; self.db.commit()
        with self.assertRaises(HTTPException): generate_2fa_secret(self.db, self.user)
        for data in (None, Disable2FARequest(code="000000")):
            with patch("pyotp.TOTP.verify", return_value=False):
                with self.assertRaises(HTTPException): disable_2fa(db=self.db, current_user=self.user, data=data)
            self.assertTrue(record.is_enabled)
        with patch("app.api.v1.endpoints.auth.create_security_event"):
            disable_2fa(db=self.db, current_user=self.user, data=Disable2FARequest(code=pyotp.TOTP(setup["secret"]).now()))
        self.assertEqual(self.db.query(TwoFactorAuth).count(), 0)
        self.assertNotEqual(generate_2fa_secret(self.db, self.user)["secret"], setup["secret"])

    def test_reset_consumes_all_owner_links_but_not_other_owner(self):
        from app.services import password_reset_service as resets
        from app.models.password_reset import PasswordResetToken
        from app.models import Session as AuthSession
        from datetime import datetime, timedelta
        first = resets.create_password_reset_token(self.db, self.user)
        second = resets.create_password_reset_token(self.db, self.user)
        other = PasswordResetToken(user_id=2, token_hash="other", expires_at=datetime.utcnow()+timedelta(minutes=30), used=False)
        session = AuthSession(user_id=1, refresh_token="synthetic-refresh", expires_at=datetime.utcnow()+timedelta(days=1))
        self.db.add_all([other, session]); self.db.commit()
        with patch.object(resets, "create_security_event"), patch.object(resets, "hash_password", return_value="changed"):
            self.assertTrue(resets.reset_password(self.db, second, "New12345"))
            self.assertFalse(resets.reset_password(self.db, first, "Attacker123"))
        self.assertTrue(session.is_revoked); self.assertFalse(other.used)
        self.assertEqual(self.user.hashed_password, "changed")

    def test_legacy_and_json_credentials_and_conflicts(self):
        from app.api.v1.endpoints.auth import session_credential
        from app.schemas.v1.auth import SessionCredentials
        self.assertEqual(session_credential("legacy", None), "legacy")
        self.assertEqual(session_credential(None, SessionCredentials(refresh_token="body")), "body")
        with self.assertRaises(HTTPException): session_credential("different", SessionCredentials(refresh_token="body"))
        with self.assertRaises(HTTPException): session_credential(None, None)

    def test_access_log_redacts_legacy_credentials(self):
        import logging
        from app.core.privacy_logging import CredentialQueryFilter
        record = logging.LogRecord("uvicorn.access", 20, "", 0, "%s %s %s %s %s", ("client", "POST", "/api/v1/auth/logout?refresh_token=secret&expo_push_token=destination&sort=asc", "1.1", 200), None)
        self.assertTrue(CredentialQueryFilter().filter(record))
        self.assertNotIn("secret", record.getMessage()); self.assertNotIn("destination", record.getMessage())
        self.assertIn("sort=asc", record.getMessage())

class CompatibilityRegressionTests(unittest.TestCase):
    def test_existing_delete_service_still_works(self):
        db = Mock(); user = Mock()
        with patch.object(user_service, "get_user", return_value=user):
            user_service.delete_user(db, 1)
        db.delete.assert_called_once_with(user); db.commit.assert_called_once()

    def test_legacy_query_and_json_session_routes(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from app.api.v1.endpoints import auth
        from app.db.session import get_db
        from types import SimpleNamespace
        from datetime import datetime, timedelta
        app = FastAPI(); app.include_router(auth.router, prefix="/api/v1")
        db = Mock(); session = SimpleNamespace(user_id=1, is_revoked=False, expires_at=datetime.utcnow()+timedelta(days=1))
        db.query.return_value.filter.return_value.with_for_update.return_value.populate_existing.return_value.first.return_value = session
        db.query.return_value.filter.return_value.first.return_value = session
        app.dependency_overrides[get_db] = lambda: db
        with TestClient(app) as client, patch.object(auth, "create_session", return_value="new-refresh"), patch.object(auth, "create_access_token", return_value="new-access"), patch.object(auth, "logout_user", return_value={"message":"Logged out successfully"}) as logout, patch.object(auth, "create_security_event"):
            for kwargs in ({"params":{"refresh_token":"old-client"}}, {"json":{"refresh_token":"new-client"}}):
                session.is_revoked = False
                result = client.post("/api/v1/auth/refresh", **kwargs)
                self.assertEqual(result.status_code, 200); self.assertEqual(result.json()["access_token"], "new-access")
                self.assertEqual(result.headers["cache-control"], "no-store")
                result = client.post("/api/v1/auth/logout", **kwargs)
                self.assertEqual(result.status_code, 200)
            self.assertEqual(client.post("/api/v1/auth/refresh", params={"refresh_token":"A"}, json={"refresh_token":"B"}).status_code, 400)
            self.assertEqual(client.post("/api/v1/auth/refresh").status_code, 422)
            self.assertEqual(logout.call_count, 2)

if __name__ == "__main__": unittest.main()
