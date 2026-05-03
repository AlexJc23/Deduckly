from app.models.enums import FilingStatus, UserRole
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    email: EmailStr
    filing_status: Optional[FilingStatus] = None

    # ❌ remove role from user input unless you want users making themselves admin
    # role: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = "user"  # default to "user" if not provided

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")

        if value.islower() or value.isupper():
            raise ValueError("Password must contain mixed case")

        if not any(char.isdigit() for char in value):
            raise ValueError("Password must include a number")

        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    password: Optional[str] = None
    role: Optional[UserRole] = "user"  # default to "user" if not provided
    filing_status: Optional[FilingStatus] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")

        if value.islower() or value.isupper():
            raise ValueError("Password must contain mixed case")

        if not any(char.isdigit() for char in value):
            raise ValueError("Password must include a number")

        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: EmailStr
    is_active: bool
    filing_status: Optional[FilingStatus]  # ← you’ll want this later
    created_at: datetime
