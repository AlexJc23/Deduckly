from typing import Optional
from pydantic import BaseModel, ConfigDict, model_validator, HttpUrl, Field
from datetime import datetime
from decimal import Decimal

from app.models.enums import ExpenseCategory


class ExpenseBase(BaseModel):
    amount: Decimal
    category: ExpenseCategory
    incurred_at: datetime

    merchant: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None

    business_percentage: Decimal = Decimal("100.00")

    receipt_url: Optional[HttpUrl] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_expense(self):
        if self.amount <= 0:
            raise ValueError("Amount must be greater than zero")

        if not Decimal("0") <= self.business_percentage <= Decimal("100"):
            raise ValueError("Business percentage must be between 0 and 100")

        return self


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    amount: Optional[Decimal] = None
    category: Optional[ExpenseCategory] = None
    incurred_at: Optional[datetime] = None

    merchant: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    business_percentage: Optional[Decimal] = None

    receipt_url: Optional[HttpUrl] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def validate_update(self):
        if self.amount is not None and self.amount <= 0:
            raise ValueError("Amount must be greater than zero")

        if (
            self.business_percentage is not None
            and not Decimal("0") <= self.business_percentage <= Decimal("100")
        ):
            raise ValueError("Business percentage must be between 0 and 100")

        return self


class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int

    created_at: datetime
    updated_at: datetime