import hashlib
import secrets

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import User
from app.models.password_reset import PasswordResetToken
from app.core.security import hash_password


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
        .filter(
            User.id == reset_token.user_id
        )
        .first()
    )

    if not user:
        return False

    user.hashed_password = hash_password(
        new_password
    )

    reset_token.used = True

    from app.models import Session as DBSession

    db.query(DBSession).filter(
        DBSession.user_id == user.id
    ).update({
        "is_revoked": True
    })

    db.commit()

    return True