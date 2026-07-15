from typing import Optional
from pydantic import BaseModel, ConfigDict, model_validator
from datetime import date, datetime
from decimal import Decimal


class MileageRateBase(BaseModel):
    effective_date: date
    business_rate: Decimal

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_business_rate(self):
        if self.business_rate < 0:
            raise ValueError("business_rate must be non-negative")

        return self


class MileageRateCreate(MileageRateBase):
    pass


class MileageRateUpdate(BaseModel):
    effective_date: Optional[date] = None
    business_rate: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_update(self):
        if (
            self.business_rate is not None
            and self.business_rate < 0
        ):
            raise ValueError("business_rate must be non-negative")

        return self


class MileageRateResponse(MileageRateBase):
    id: int
    created_at: datetime
    updated_at: datetime