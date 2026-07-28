from app.models.enums import Currency, DistanceUnit, FilingStatus, UserRole, BusinessType, TaxMethod, WeekStartsOn
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal


class UserBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    email: EmailStr

    filing_status: Optional[FilingStatus] = None
    business_type: BusinessType = BusinessType.OTHER
    tax_method: TaxMethod = TaxMethod.STANDARD_MILEAGE


class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.USER

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

    role: Optional[UserRole] = None
    filing_status: Optional[FilingStatus] = None
    business_type: Optional[BusinessType] = None
    tax_method: Optional[TaxMethod] = None

    # Goals
    monthly_income_goal: Decimal | None = None
    weekly_income_goal: Decimal | None = None

    # Offer Analyzer
    cost_per_mile: Decimal | None = None
    minimum_profit: Decimal | None = None
    minimum_hourly_rate: Decimal | None = None
    minimum_dollars_per_mile: Decimal | None = None
    preferred_max_distance: Decimal | None = None
    default_platform: str | None = None

    # Localization
    timezone: str | None = None
    currency: Currency | None = None
    distance_unit: DistanceUnit | None = None
    week_starts_on: WeekStartsOn | None = None



    # Notifications
    notifications_enabled: bool | None = None
    trip_reminders_enabled: bool | None = None
    goal_reminders_enabled: bool | None = None

    # Tracking
    auto_trip_detection: bool | None = None

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


class UpdatePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int

    first_name: str
    last_name: str
    email: EmailStr

    is_active: bool

    filing_status: Optional[FilingStatus]
    business_type: str
    tax_method: str

    # Goals
    monthly_income_goal: Decimal | None = None
    weekly_income_goal: Decimal | None = None

    # Offer Analyzer
    cost_per_mile: Decimal | None = None
    minimum_profit: Decimal | None = None
    minimum_hourly_rate: Decimal | None = None
    minimum_dollars_per_mile: Decimal | None = None
    preferred_max_distance: Decimal | None = None
    default_platform: str | None = None

    # Localization
    timezone: str
    currency: Currency
    distance_unit: DistanceUnit
    week_starts_on: WeekStartsOn


    # Notifications
    notifications_enabled: bool
    trip_reminders_enabled: bool
    goal_reminders_enabled: bool

    # Tracking
    auto_trip_detection: bool

    created_at: datetime