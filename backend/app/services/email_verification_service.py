import hashlib
import secrets

from datetime import datetime, timedelta

from app.services.security_event_service import create_security_event
from sqlalchemy.orm import Session

from app.models import User
from app.models.email_verification import EmailVerificationToken


VERIFICATION_TOKEN_EXPIRE_MINUTES = 30


def create_email_verification_token(
    db: Session,
    user: User,
) -> str:

    db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == user.id,
        EmailVerificationToken.used == False,
    ).update({
        "used": True
    })
    token = secrets.token_urlsafe(48)

    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    verification_token = EmailVerificationToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=(
            datetime.utcnow()
            + timedelta(
                minutes=VERIFICATION_TOKEN_EXPIRE_MINUTES
            )
        ),
        used=False,
    )

    db.add(verification_token)
    db.commit()

    return token


def verify_email(
    db: Session,
    token: str,
) -> bool:
    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    verification_token = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.token_hash == token_hash,
            EmailVerificationToken.used == False,
        )
        .first()
    )

    if not verification_token:
        return False

    if verification_token.expires_at <= datetime.utcnow():
        return False

    user = (
        db.query(User)
        .filter(
            User.id == verification_token.user_id
        )
        .first()
    )

    if not user:
        return False

    user.email_verified = True
    verification_token.used = True

    create_security_event(
        db,
        event_type="email_verified",
        user_id=user.id,
    )

    db.commit()

    return True