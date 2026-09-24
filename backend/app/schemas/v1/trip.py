from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from decimal import Decimal
from app.models.enums import TripPlatform, TripCategory


# Base (shared structure)
class TripBase(BaseModel):
    start_time: datetime
    end_time: datetime

    distance_miles: Optional[Decimal] = None

    start_lat: Optional[Decimal] = None
    start_lng: Optional[Decimal] = None
    end_lat: Optional[Decimal] = None
    end_lng: Optional[Decimal] = None

    start_address: Optional[str] = None
    end_address: Optional[str] = None

    platform: TripPlatform
    category: TripCategory


# Create (same as base)
class TripCreate(TripBase):
    client_id: Optional[str] = Field(default=None, min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")
    income_amount: Optional[Decimal] = None  # New field for income


# Update (ALL optional, no inheritance)
class TripUpdate(BaseModel):
    income_amount: Optional[Decimal] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    distance_miles: Optional[Decimal] = None

    start_lat: Optional[Decimal] = None
    start_lng: Optional[Decimal] = None
    end_lat: Optional[Decimal] = None
    end_lng: Optional[Decimal] = None

    start_address: Optional[str] = None
    end_address: Optional[str] = None

    platform: Optional[TripPlatform] = None
    category: Optional[TripCategory] = None


# Response (clean output)
class TripResponse(TripBase):
    model_config = ConfigDict(from_attributes=True)

    client_id: Optional[str] = None
    income_amount: Optional[Decimal] = None
    id: int
    user_id: int
    deduction_amount: Optional[Decimal] = None
    distance_miles: Optional[Decimal] = None

    created_at: datetime
    updated_at: datetime
