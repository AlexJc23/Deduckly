from typing import Optional
from pydantic import BaseModel, ConfigDict, model_validator
from datetime import datetime
from decimal import Decimal


class MileageRateBase(BaseModel):
    year: int
    rate: Decimal

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_rate(self):
        if self.rate < 0:
            raise ValueError("rate must be non-negative")

        if self.year < 2000 or self.year > 2100:
            raise ValueError("year must be between 2000 and 2100")

        return self


class MileageRateCreate(MileageRateBase):
    pass


class MileageRateUpdate(BaseModel):
    year: Optional[int] = None
    rate: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_update(self):
        if self.rate is not None and self.rate < 0:
            raise ValueError("rate must be non-negative")

        if self.year is not None and (self.year < 2000 or self.year > 2100):
            raise ValueError("year must be between 2000 and 2100")

        return self


class MileageRateResponse(MileageRateBase):
    id: int
    created_at: datetime
    updated_at: datetime
