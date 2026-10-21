import hashlib
import secrets

from datetime import datetime, timedelta

from sqlalchemy.orm import Session, lazyload

from app.models import User
from app.models.password_reset import PasswordResetToken
from app.core.security import hash_password
from app.services.security_event_service import create_security_event

RESET_TOKEN_EXPIRE_MINUTES = 30


def create_password_reset_token(
    db: Session,
    user: User,
) -> str:
    token = secrets.token_urlsafe(48)

    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=(
            datetime.utcnow()
            + timedelta(
                minutes=RESET_TOKEN_EXPIRE_MINUTES
            )
        ),
        used=False,
    )

    db.add(reset_token)
    db.commit()

    return token


def reset_password(
    db: Session,
    token: str,
    new_password: str,
) -> bool:
    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used == False,
        )
        .first()
    )

    if not reset_token:
        return False

    if reset_token.expires_at <= datetime.utcnow():
        return False

    user = (
        db.query(User)
        .options(lazyload("*"))
        .filter(User.id == reset_token.user_id)
        .with_for_update()
        .first()
    )

    if not user:
        return False

    # Re-read after the owner lock: another reset may have consumed this token.
    db.refresh(reset_token)
    if reset_token.used or reset_token.expires_at <= datetime.utcnow():
        return False

    user.hashed_password = hash_password(
        new_password
    )

    invalidate_password_resets(db, user.id)

    from app.models import Session as DBSession

    db.query(DBSession).filter(
        DBSession.user_id == user.id
    ).update({
        "is_revoked": True
    })

    create_security_event(
        db,
        event_type="password_reset_success",
        user_id=user.id,
    )

    db.commit()

    return True

def invalidate_password_resets(db: Session, user_id: int) -> None:
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.used == False,
    ).update({"used": True}, synchronize_session="fetch")
