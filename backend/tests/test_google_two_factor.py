import unittest
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch
from urllib.parse import urlparse, parse_qs
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException
from app.api.v1.endpoints import auth
from app.models.google_oauth_transaction import GoogleOAuthTransaction as Transaction
from app.services import google_transaction_service as flow, oauth_service
from app.schemas.v1.oauth import GoogleStart, GoogleExchange, OAuthUserCreate

class GoogleFlowTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
        Transaction.__table__.create(self.engine)
        self.db=Session(self.engine, expire_on_commit=False)
        self.verifier="v"*64
        self.info={"sub":"google-id", "email":"test@example.com", "email_verified":True}
        self.exchange=patch.object(flow,"exchange_google_code_for_tokens",AsyncMock(return_value={"access_token":"provider-token"})).start()
        self.userinfo=patch.object(flow,"get_google_user_info",AsyncMock(side_effect=lambda *_:self.info)).start()
        self.addCleanup(patch.stopall)
    def tearDown(self): self.db.close();self.engine.dispose()
    def start(self): return auth.google_start(GoogleStart(code_challenge=flow.challenge(self.verifier)),self.db)
    async def callback(self,start):
        response=await auth.google_callback(state=start["state"],code="provider-code",db=self.db)
        params={k:v[0] for k,v in parse_qs(urlparse(response.headers["location"]).query).items()}
        self.assertNotIn("access_token",params);self.assertNotIn("refresh_token",params)
        self.assertEqual(response.headers["cache-control"],"no-store")
        return GoogleExchange(**params,code_verifier=self.verifier)
    async def test_valid_exchange_and_replay(self):
        start=self.start();q=parse_qs(urlparse(start["authorization_url"]).query)
        self.assertEqual(q["state"],[start["state"]]);self.assertEqual(q["code_challenge_method"],["S256"])
        payload=await self.callback(start)
        self.assertEqual(flow.challenge(self.exchange.call_args.args[1]),q["code_challenge"][0])
        self.assertEqual(flow.redeem(self.db,payload.state,payload.code,payload.code_verifier)["sub"],"google-id")
        with self.assertRaises(HTTPException): flow.redeem(self.db,payload.state,payload.code,payload.code_verifier)
    async def test_wrong_state_and_verifier(self):
        start=self.start()
        for state in ("", "x"*43):
            with self.assertRaises(HTTPException): await auth.google_callback(state=state,code="code",db=self.db)
        payload=await self.callback(start)
        with self.assertRaises(HTTPException): flow.redeem(self.db,payload.state,payload.code,"wrong"*16)
        self.assertEqual(flow.redeem(self.db,payload.state,payload.code,self.verifier)["email"],self.info["email"])
    async def test_expired_callback_state(self):
        start=self.start()
        self.db.query(Transaction).update({"expires_at":datetime.now(timezone.utc)-timedelta(seconds=1)});self.db.commit()
        with self.assertRaises(HTTPException): await self.callback(start)
        self.exchange.assert_not_called()
    async def test_wrong_exchange_state(self):
        payload=await self.callback(self.start())
        with self.assertRaises(HTTPException): flow.redeem(self.db,"x"*43,payload.code,self.verifier)
    def test_migration_upgrade_and_downgrade(self):
        import importlib.util
        from pathlib import Path
        from sqlalchemy import inspect
        from alembic.migration import MigrationContext
        from alembic.operations import Operations
        file=Path(__file__).resolve().parents[1]/"alembic/versions/d83ea4f5b213_google_oauth_transactions.py"
        spec=importlib.util.spec_from_file_location("oauth_migration",file);migration=importlib.util.module_from_spec(spec);spec.loader.exec_module(migration)
        engine=create_engine("sqlite://")
        with engine.begin() as connection:
            with Operations.context(MigrationContext.configure(connection)):
                migration.upgrade();self.assertIn("google_oauth_transactions",inspect(connection).get_table_names())
                migration.downgrade();self.assertNotIn("google_oauth_transactions",inspect(connection).get_table_names())
        engine.dispose()
    async def test_expired_exchange(self):
        payload=await self.callback(self.start())
        self.db.query(Transaction).update({"expires_at":datetime.now(timezone.utc)-timedelta(seconds=1)});self.db.commit()
        with self.assertRaises(HTTPException): flow.redeem(self.db,payload.state,payload.code,self.verifier)
    async def test_unverified_email_rejected(self):
        for verified in (False, "true", None):
            self.info["email_verified"]=verified
            with self.assertRaises(HTTPException): await self.callback(self.start())
    async def test_cancel_consumes_state(self):
        start=self.start();response=await auth.google_callback(state=start["state"],error="access_denied",db=self.db)
        self.assertIn("error=cancelled",response.headers["location"])
        with self.assertRaises(HTTPException): await self.callback(start)
    async def test_concurrent_callback_completes_only_once(self):
        import asyncio
        start=self.start()
        arrived=0
        both=asyncio.Event()
        async def provider(*_):
            nonlocal arrived
            arrived+=1
            if arrived==2: both.set()
            await both.wait()
            return {"access_token":"provider-token"}
        self.exchange.side_effect=provider
        # Separate DB sessions, as used by separate HTTP requests.
        second=Session(self.engine,expire_on_commit=False)
        try:
            results=await asyncio.gather(
                auth.google_callback(state=start["state"],code="code",db=self.db),
                auth.google_callback(state=start["state"],code="code",db=second),return_exceptions=True)
            self.assertEqual(sum(not isinstance(result,Exception) for result in results),1)
            self.assertEqual(sum(isinstance(result,HTTPException) for result in results),1)
        finally: second.close()
    async def test_callback_replay_rejected(self):
        start=self.start();await self.callback(start)
        with self.assertRaises(HTTPException): await self.callback(start)
    async def test_exchange_issues_normal_or_two_factor_credentials(self):
        for two_factor in (False,True):
            payload=await self.callback(self.start())
            query=self.db.query
            factor=Mock();factor.filter.return_value.first.return_value=SimpleNamespace(is_enabled=True) if two_factor else None
            with patch.object(self.db,"query",side_effect=lambda model:factor if model is auth.TwoFactorAuth else query(model)), patch.object(auth,"get_or_create_oauth_user",return_value=SimpleNamespace(id=42,is_active=True)), patch.object(auth,"create_access_token",return_value="full") as access, patch.object(auth,"create_2fa_token",return_value="temporary"), patch.object(auth,"create_session",return_value="refresh") as session, patch.object(auth,"create_security_event"), patch.object(auth,"create_analytics_event"):
                result=auth.google_exchange(payload,self.db)
                if two_factor:
                    self.assertEqual(result,{"access_token":"temporary","requires_2fa":True});session.assert_not_called();access.assert_not_called()
                else: self.assertEqual(result,{"access_token":"full","refresh_token":"refresh"})
    async def test_inactive_user_rejected_at_exchange(self):
        payload=await self.callback(self.start())
        with patch.object(auth,"get_or_create_oauth_user",return_value=SimpleNamespace(id=42,is_active=False)),patch.object(auth,"create_session") as session:
            with self.assertRaises(HTTPException): auth.google_exchange(payload,self.db)
            session.assert_not_called()
    def test_inactive_existing_oauth_and_email_matches_not_linked(self):
        for existing_oauth in (True,False):
            db=Mock();inactive=SimpleNamespace(is_active=False)
            db.query.return_value.filter.return_value.first.side_effect=([SimpleNamespace(user=inactive)] if existing_oauth else [None,inactive])
            with self.assertRaises(HTTPException): oauth_service.get_or_create_oauth_user(db,OAuthUserCreate(email="test@example.com",provider="google",provider_user_id="id"))
            db.add.assert_not_called()
    def test_http_validation_and_no_store(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        app=FastAPI();app.include_router(auth.router,prefix="/api/v1")
        app.dependency_overrides[auth.get_db]=lambda:self.db
        with TestClient(app) as client:
            response=client.post("/api/v1/auth/google/start",json={"code_challenge":flow.challenge(self.verifier)})
            self.assertEqual(response.status_code,200)
            self.assertEqual(response.headers["cache-control"],"no-store")
            self.assertEqual(client.post("/api/v1/auth/google/exchange",json={"state":"bad"}).status_code,422)
            self.assertEqual(client.get("/api/v1/auth/google/login").status_code,410)
    def test_legacy_start_fails_closed(self):
        with self.assertRaises(HTTPException) as caught: auth.google_login()
        self.assertEqual(caught.exception.status_code,410)
    def test_password_login_and_two_factor_unchanged(self):
        for enabled in (False,True):
            db=Mock();db.query.return_value.filter.return_value.first.return_value=SimpleNamespace(is_enabled=True) if enabled else None
            with patch.object(auth,"authenticate_user",return_value=(SimpleNamespace(id=42,email_verified=True),"success")),patch.object(auth,"create_access_token",return_value="full"),patch.object(auth,"create_2fa_token",return_value="temporary"),patch.object(auth,"create_session",return_value="refresh"),patch.object(auth,"create_security_event"),patch.object(auth,"create_analytics_event"):
                result=auth.login(SimpleNamespace(username="test",password="test"),db)
                self.assertEqual(result["access_token"],"temporary" if enabled else "full")
                self.assertEqual("refresh_token" in result,not enabled)

if __name__=="__main__": unittest.main()
