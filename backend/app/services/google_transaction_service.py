import base64
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.security import encrypt_secret, decrypt_secret
from app.models.google_oauth_transaction import GoogleOAuthTransaction as Transaction
from app.services.oauth_service import get_google_authorization_url, exchange_google_code_for_tokens, get_google_user_info


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("ascii")).hexdigest()

def challenge(value: str) -> str:
    return base64.urlsafe_b64encode(hashlib.sha256(value.encode("ascii")).digest()).rstrip(b"=").decode("ascii")

def invalid():
    return HTTPException(status_code=400, detail="Google sign-in expired or invalid. Please start again.")

def begin(db: Session, app_challenge: str):
    now = datetime.now(timezone.utc)
    db.query(Transaction).filter(Transaction.expires_at <= now).delete(synchronize_session=False)
    state, verifier = secrets.token_urlsafe(32), secrets.token_urlsafe(48)
    db.add(Transaction(state_hash=digest(state), app_challenge=app_challenge,
        google_verifier=encrypt_secret(verifier), expires_at=now+timedelta(minutes=10)))
    db.commit()
    return {"state": state, "authorization_url": get_google_authorization_url(state, challenge(verifier))}

def pending(db, state):
    if not state or len(state) != 43 or not all(c.isascii() and (c.isalnum() or c in "-_") for c in state):
        raise invalid()
    row = db.query(Transaction).filter(Transaction.state_hash == digest(state),
        Transaction.expires_at > datetime.now(timezone.utc), Transaction.exchange_hash.is_(None)).first()
    if row is None: raise invalid()
    return row

async def complete_callback(db: Session, state: str, code: str | None, error: str | None):
    row = pending(db, state)
    if error:
        db.delete(row); db.commit()
        return {"state": state, "error": "cancelled"}
    if not code: raise invalid()
    try:
        tokens = await exchange_google_code_for_tokens(code, decrypt_secret(row.google_verifier))
        info = await get_google_user_info(tokens["access_token"])
    except Exception:
        db.rollback()
        raise HTTPException(status_code=503, detail="Google sign-in unavailable. Please start again.") from None
    if info.get("email_verified") is not True or not isinstance(info.get("sub"), str) or not info["sub"] or not isinstance(info.get("email"), str) or not info["email"]:
        db.delete(row); db.commit()
        raise HTTPException(status_code=400, detail="A verified Google email is required")
    exchange = secrets.token_urlsafe(32)
    identity = {key: info.get(key, "") for key in ("sub", "email", "given_name", "family_name")}
    updated = db.query(Transaction).filter(Transaction.state_hash == row.state_hash,
        Transaction.exchange_hash.is_(None), Transaction.expires_at > datetime.now(timezone.utc)).update({
            "exchange_hash": digest(exchange), "identity": identity, "google_verifier": "",
            "expires_at": datetime.now(timezone.utc)+timedelta(seconds=60)}, synchronize_session=False)
    if updated != 1: db.rollback(); raise invalid()
    db.commit()
    return {"state": state, "code": exchange}

def redeem(db: Session, state: str, code: str, verifier: str):
    row = db.query(Transaction).filter(Transaction.state_hash == digest(state),
        Transaction.exchange_hash == digest(code), Transaction.expires_at > datetime.now(timezone.utc)).with_for_update().first()
    if row is None or not row.identity or not secrets.compare_digest(challenge(verifier), row.app_challenge): raise invalid()
    identity = dict(row.identity)
    # Conditional deletion is the single-use boundary, even across concurrent workers.
    removed = db.query(Transaction).filter(Transaction.state_hash == row.state_hash,
        Transaction.exchange_hash == digest(code), Transaction.expires_at > datetime.now(timezone.utc)).delete(synchronize_session=False)
    if removed != 1: db.rollback(); raise invalid()
    db.commit()
    return identity
