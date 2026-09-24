from fastapi import HTTPException

from sqlalchemy.orm import Session
from app.models import User, TwoFactorAuth
from app.schemas.v1.auth import Enable2FAResponse, Verify2FARequest
from app.core.security import encrypt_secret, decrypt_secret
from sqlalchemy.exc import SQLAlchemyError

from app.models.session import Session as DBSession

import pyotp

def generate_2fa_secret(db: Session, user: User):
    existing_2fa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()
    if existing_2fa:
        secret = existing_2fa.secret
    else:
        secret = pyotp.random_base32()
        new_2fa = TwoFactorAuth(
            user_id=user.id,
            secret=secret,
            is_enabled=False
        )
        db.add(new_2fa)
        db.commit()

    otpauth_url = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="Deduckly")

    return {
        "secret": secret,
        "otpauth_url": otpauth_url
    }

def verify_2fa_code(db: Session, user: User, code: str) -> bool:
    record = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()
    if not record:
        return False

    totp = pyotp.TOTP(record.secret)

    if not totp.verify(code):
        return False

    # enable 2FA afer successful verification
    record.is_enabled = True
    db.commit()

    return True

def logout_user(db: Session, refresh_token: str, expo_push_token: str | None = None):
    try:
        session = db.query(DBSession).filter(
            DBSession.refresh_token == refresh_token
        ).first()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        from app.services.push_registration_service import unregister_push_token
        unregister_push_token(db, session.user_id, expo_push_token)
        if session.is_revoked:
            db.commit()
            return {"message": "Already logged out"}

        session.is_revoked = True

        db.commit()

        return {"message": "Logged out successfully"}

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Logout failed")
