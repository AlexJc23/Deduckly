import unittest
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from jose import jwt, jwk
from fastapi import HTTPException
from app.services import apple_auth_service as apple

class IdentityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        cls.private = key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption())
        cls.public = jwk.construct(key.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo), "RS256").to_dict()
        cls.public["kid"] = "test-key"
    def claims(self, **changes):
        return dict({"sub":"apple-user", "iss":apple.APPLE, "aud":apple.settings.apple_client_id, "exp":datetime.now(timezone.utc)+timedelta(minutes=5), "nonce":"test-nonce", "email":"private@privaterelay.appleid.com", "email_verified":"true"}, **changes)
    def token(self, **changes):
        return jwt.encode(self.claims(**changes), self.private, algorithm="RS256", headers={"kid":"test-key"})
    def test_valid_signed_identity(self):
        self.assertEqual(apple.verify_identity(self.token(), {"keys":[self.public]}, "test-nonce")["sub"], "apple-user")
    def test_rejects_wrong_nonce_audience_issuer_expiry(self):
        for changes in ({"nonce":"wrong"}, {"aud":"another-app"}, {"iss":"https://attacker.invalid"}, {"exp":datetime.now(timezone.utc)-timedelta(minutes=1)}):
            with self.subTest(changes=changes), self.assertRaises(HTTPException):
                apple.verify_identity(self.token(**changes), {"keys":[self.public]}, "test-nonce")
    def test_unknown_signing_key(self):
        with self.assertRaises(HTTPException): apple.verify_identity(self.token(), {"keys":[]}, "test-nonce")
    def test_rejects_unsigned_or_symmetric_identity(self):
        token = jwt.encode(self.claims(), "fake-key", algorithm="HS256")
        with self.assertRaises(HTTPException): apple.verify_identity(token, {"keys":[self.public]}, "test-nonce")
    def test_temporary_two_factor_token_cannot_access_account_api(self):
        from app.api.dependencies import auth
        from app.core.security import create_2fa_token
        with patch.object(auth,"get_user") as get_user:
            with self.assertRaises(HTTPException) as error: auth.get_current_user(create_2fa_token(42),Mock())
            self.assertEqual(error.exception.status_code,401); get_user.assert_not_called()

    def test_completed_access_token_still_works(self):
        from app.api.dependencies import auth
        from app.core.security import create_access_token
        expected=object()
        with patch.object(auth,"get_user",return_value=expected):
            self.assertIs(auth.get_current_user(create_access_token({"sub":"42"}),Mock()),expected)

    def test_challenge_is_signed_and_expires(self):
        with patch.object(apple, "ensure_configured"):
            challenge = apple.create_challenge()
        self.assertEqual(apple.decode_challenge(challenge["challenge"]), challenge["nonce"])
        expired = jwt.encode({"nonce":"x", "aud":"deduckly-apple-login", "exp":datetime.now(timezone.utc)-timedelta(minutes=1)}, apple.settings.secret_key, algorithm="HS256")
        with self.assertRaises(HTTPException): apple.decode_challenge(expired)
    def test_existing_email_is_not_silently_linked(self):
        db = Mock(); db.query.return_value.filter.return_value.first.side_effect=[None, object()]
        with self.assertRaises(HTTPException) as error: apple.save_apple_user(db, self.claims(), "encrypted")
        self.assertEqual(error.exception.status_code, 409); db.add.assert_not_called()
    def test_disabled_account_cannot_login(self):
        db = Mock(); db.query.return_value.filter.return_value.first.return_value=SimpleNamespace(user=SimpleNamespace(is_active=False))
        with self.assertRaises(HTTPException) as error: apple.save_apple_user(db, self.claims(), "encrypted")
        self.assertEqual(error.exception.status_code, 403); db.commit.assert_not_called()
    def test_repeat_login_does_not_need_name_or_email(self):
        user=SimpleNamespace(is_active=True); account=SimpleNamespace(user=user, apple_refresh_token="old")
        db=Mock(); db.query.return_value.filter.return_value.first.return_value=account
        self.assertIs(apple.save_apple_user(db, {"sub":"apple-user"}, "encrypted-new"), user)
        self.assertEqual(account.apple_refresh_token, "encrypted-new")

class ExchangeTests(unittest.IsolatedAsyncioTestCase):
    async def test_apple_login_preserves_two_factor(self):
        from app.api.v1.endpoints import apple as endpoint
        db=Mock(); db.query.return_value.filter.return_value.first.return_value=object()
        with patch.object(endpoint,"exchange_code",new=AsyncMock(return_value=({"sub":"apple-user"}, "encrypted"))), patch.object(endpoint,"save_apple_user",return_value=SimpleNamespace(id=42)), patch.object(endpoint,"create_session") as session, patch.object(endpoint,"create_access_token") as access:
            result=await endpoint.login(endpoint.AppleLogin(code="code",challenge="challenge"),db)
            from app.core.security import decode_access_token
            self.assertEqual(decode_access_token(result["access_token"])["type"],"2fa")
            session.assert_not_called(); access.assert_not_called()

    async def test_used_code_rejected(self):
        client=AsyncMock(); client.post.return_value=Mock(status_code=400)
        with patch.object(apple, "decode_challenge", return_value="nonce"), patch.object(apple,"client_secret",return_value="secret"), patch.object(apple.httpx,"AsyncClient") as factory:
            factory.return_value.__aenter__.return_value=client
            with self.assertRaises(HTTPException) as error: await apple.exchange_code("used-code", "challenge")
        self.assertEqual(error.exception.status_code,401)
    async def test_non_apple_deletion_does_not_call_apple(self):
        with patch.object(apple,"client_secret") as secret:
            await apple.revoke_apple_accounts(SimpleNamespace(oauth_accounts=[]))
            secret.assert_not_called()
    async def test_revocation_failure_does_not_report_success(self):
        client=AsyncMock(); client.post.side_effect=RuntimeError("offline")
        with patch.object(apple,"client_secret",return_value="secret"), patch.object(apple,"decrypt_secret",return_value="refresh"), patch.object(apple.httpx,"AsyncClient") as factory:
            factory.return_value.__aenter__.return_value=client
            with self.assertRaises(HTTPException) as error:
                await apple.revoke_apple_accounts(SimpleNamespace(oauth_accounts=[SimpleNamespace(provider="apple",apple_refresh_token="encrypted")]))
        self.assertEqual(error.exception.status_code,503)

if __name__ == "__main__": unittest.main()
