from pydantic import BaseModel, Field
from typing import Optional

class OAuthUserCreate(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    provider: str
    provider_user_id: str


class GoogleStart(BaseModel):
    code_challenge: str = Field(pattern=r"^[A-Za-z0-9_-]{43}$")

class GoogleExchange(BaseModel):
    state: str = Field(pattern=r"^[A-Za-z0-9_-]{43}$")
    code: str = Field(pattern=r"^[A-Za-z0-9_-]{43}$")
    code_verifier: str = Field(pattern=r"^[A-Za-z0-9._~-]{43,128}$")
