"""Persistent, serialized password-login limits shared by server workers."""
import hashlib
import hmac
import ipaddress
import math
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.dialects.postgresql import insert as postgres_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

from app.core.config import settings
from app.models.login_attempt import LoginAttempt
from app.services.user_service import authenticate_user

COOLDOWN_SECONDS = 15 * 60
EMAIL_FAILURE_LIMIT = 5
NETWORK_FAILURE_LIMIT = 50


def _key(value):
    return hmac.new(settings.secret_key.encode(), value.encode(), hashlib.sha256).hexdigest()


def authenticate_with_cooldown(db, email, password, address, now=None):
    now = now or datetime.utcnow()
    # Pair the email with the connection so knowing an email cannot lock its
    # owner out on every device. Never trust arbitrary forwarded IP headers.
    keys = {_key("email:" + address + ":" + email.strip().casefold()): EMAIL_FAILURE_LIMIT}
    try:
        public_address = ipaddress.ip_address(address).is_global
    except ValueError:
        public_address = False
    # A container/proxy address may be shared by the whole app. Only apply
    # the broader connection limit to a resolved public client address.
    if public_address:
        keys[_key("network:" + address)] = NETWORK_FAILURE_LIMIT
    insert = sqlite_insert if db.bind.dialect.name == "sqlite" else postgres_insert
    rows = []
    try:
        db.query(LoginAttempt).filter(LoginAttempt.expires_at <= now).delete(synchronize_session=False)
        for key in sorted(keys):
            db.execute(insert(LoginAttempt).values(
                key=key, failures=0, expires_at=now + timedelta(seconds=COOLDOWN_SECONDS)
            ).on_conflict_do_nothing(index_elements=["key"]))
            row = db.query(LoginAttempt).filter_by(key=key).with_for_update().populate_existing().one()
            rows.append(row)
        remaining = max((math.ceil((row.expires_at - now).total_seconds())
                         for row in rows if row.failures >= keys[row.key]), default=0)
        if remaining:
            db.commit()
            _reject(remaining)
        user, status = authenticate_user(db, email, password)
        if status == "invalid_credentials":
            for row in rows:
                row.failures += 1
                if row.failures == keys[row.key]:
                    row.expires_at = now + timedelta(seconds=COOLDOWN_SECONDS)
            blocked = any(row.failures >= keys[row.key] for row in rows)
            db.commit()
            if blocked:
                _reject(COOLDOWN_SECONDS)
        else:
            # A good password clears this email's count without erasing other
            # users' failed attempts on the same connection.
            pair = _key("email:" + address + ":" + email.strip().casefold())
            db.query(LoginAttempt).filter_by(key=pair).delete(synchronize_session=False)
            db.commit()
        return user, status
    except Exception:
        db.rollback()
        raise


def _reject(seconds):
    raise HTTPException(429, "Too many login attempts. Please wait or use Forgot password.",
                        headers={"Retry-After": str(seconds), "Cache-Control": "no-store"})
