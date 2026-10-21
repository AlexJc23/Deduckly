from pydantic import BaseModel, ConfigDict, field_validator, Field
from datetime import datetime
from typing import Optional

class Enable2FAResponse(BaseModel):
    secret: str
    otpauth_url: str



class Verify2FARequest(BaseModel):
    code: str


class SessionCredentials(BaseModel):
    refresh_token: str = Field(min_length=1, max_length=512)
    expo_push_token: str | None = Field(default=None, max_length=512)


class Disable2FARequest(BaseModel):
    code: str = Field(pattern=r"^[0-9]{6}$")
