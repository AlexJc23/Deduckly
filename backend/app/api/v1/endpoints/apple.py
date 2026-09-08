from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import TwoFactorAuth
from app.core.security import create_access_token, create_2fa_token
from app.api.v1.endpoints.auth import create_session
from app.services.apple_auth_service import create_challenge, exchange_code, save_apple_user

router = APIRouter(prefix="/auth/apple", tags=["auth"])

class AppleLogin(BaseModel):
    code: str = Field(min_length=1, max_length=4096)
    challenge: str = Field(min_length=1, max_length=4096)
    first_name: str | None = Field(default=None, max_length=50)
    last_name: str | None = Field(default=None, max_length=50)

@router.post("/challenge")
def challenge():
    return create_challenge()

@router.post("/login")
async def login(data: AppleLogin, db: Session = Depends(get_db)):
    claims, encrypted_refresh = await exchange_code(data.code, data.challenge)
    user = save_apple_user(db, claims, encrypted_refresh, data.first_name, data.last_name)
    two_fa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id, TwoFactorAuth.is_enabled == True).first()
    if two_fa:
        return {"access_token": create_2fa_token(user.id), "token_type": "bearer"}
    return {"access_token": create_access_token({"sub": str(user.id)}), "refresh_token": create_session(db, user.id), "token_type": "bearer"}
