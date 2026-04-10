from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.v1.user import UserCreate, UserLogin
from app.schemas.v1.auth import Enable2FAResponse, Verify2FARequest
from app.services.user_service import authenticate_user, create_user
from app.services.auth_services import generate_2fa_secret, verify_2fa_code
from app.core.security import create_access_token, create_refresh_token, decode_access_token
from app.api.dependencies.auth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from app.models import User, TwoFactorAuth

router = APIRouter(prefix="/auth", tags=["auth"])




@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    two_fa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()

    if two_fa and two_fa.is_enabled:
        return {
            "message": "2FA required",
            "user_id": user.id,
        }

    access_token = create_access_token(data = {"sub": str(user.id)})
    refresh_token = create_refresh_token(data = {"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/enable-2fa", response_model=Enable2FAResponse)
def enable_2fa(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return generate_2fa_secret(db, current_user)

@router.post("/verify-2fa")
def verify_2fa(request: Verify2FARequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    valid = verify_2fa_code(db, current_user, request.code)
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    access_token = create_access_token(data={"sub": str(current_user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = create_user(db, user_in)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(refresh_token)
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        new_access_token = create_access_token(data={"sub": user_id})
        new_refresh_token = create_refresh_token(data={"sub": user_id})

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
        }
    except HTTPException as e:
        raise e
