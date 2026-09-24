"""Destination ownership only; never changes another account's preferences."""
import hashlib
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import lazyload
from fastapi import HTTPException
from app.models.user import User


def lock_push_token(db, token):
    # Also covers an unassigned token: row locks alone cannot lock absence.
    if token and db.get_bind().dialect.name == "postgresql":
        key = int.from_bytes(hashlib.sha256(token.encode()).digest()[:8], "big", signed=True)
        db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": key})


def register_push_token(db, user_id, token, timezone=None):
    token = token or None
    try:
        lock_push_token(db, token)
        if token:
            db.query(User).filter(User.expo_push_token == token, User.id != user_id).update(
                {User.expo_push_token: None}, synchronize_session="fetch")
        user = db.query(User).options(lazyload("*")).filter(User.id == user_id).with_for_update().populate_existing().one()
        if not user.is_active:
            raise HTTPException(status_code=401, detail="Account is inactive")
        user.expo_push_token = token
        if timezone is not None:
            user.timezone = timezone
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Notification registration changed; retry registration")
    except Exception:
        db.rollback()
        raise


def unregister_push_token(db, user_id, token):
    if not token:
        return
    lock_push_token(db, token)
    # An old device/logout cannot clear a newer token or another account's token.
    db.query(User).filter(User.id == user_id, User.expo_push_token == token).update(
        {User.expo_push_token: None}, synchronize_session="fetch")
    # The caller commits together with session revocation.
