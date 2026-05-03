from typing import Optional
from pydantic import BaseModel, ConfigDict, model_validator
from datetime import datetime
from decimal import Decimal


class TaxBracketBase(BaseModel):
    year: int
    filing_status: str

    min_income: Decimal
    max_income: Optional[Decimal] = None

    rate: Decimal

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_bracket(self):
        if self.min_income < 0:
            raise ValueError("min_income must be non-negative")

        if self.rate < 0 or self.rate > 1:
            raise ValueError("rate must be between 0 and 1")

        if self.max_income is not None and self.max_income <= self.min_income:
            raise ValueError("max_income must be greater than min_income")

        return self


class TaxBracketCreate(TaxBracketBase):
    pass


class TaxBracketUpdate(BaseModel):
    year: Optional[int] = None
    filing_status: Optional[str] = None  # fixed typo

    min_income: Optional[Decimal] = None
    max_income: Optional[Decimal] = None
    rate: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_update(self):
        if self.min_income is not None and self.min_income < 0:
            raise ValueError("min_income must be non-negative")

        if self.rate is not None and (self.rate < 0 or self.rate > 1):
            raise ValueError("rate must be between 0 and 1")

        # only validate if BOTH provided (rest handled in service)
        if (
            self.max_income is not None
            and self.min_income is not None
            and self.max_income <= self.min_income
        ):
            raise ValueError("max_income must be greater than min_income")

        return self


class TaxBracketResponse(TaxBracketBase):
    id: int
    created_at: datetime
