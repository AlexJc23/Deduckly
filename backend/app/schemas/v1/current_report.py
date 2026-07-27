from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel


class ExpenseBreakdownItem(BaseModel):
    amount: float
    count: int
    business_percentage: float


class DeductibleBreakdownItem(BaseModel):
    amount: float
    count: int


class NonDeductibleBreakdownItem(BaseModel):
    amount: float
    count: int
    reason: str


class CurrentReport(BaseModel):
    year: int
    month: Optional[int] = None
    day: Optional[int] = None

    start_date: Optional[date] = None
    end_date: Optional[date] = None

    first_name: str
    last_name: str
    filing_status: str

    generated_at_utc: datetime

    total_income: float
    total_expenses: float
    total_miles: float

    mileage_deduction: float
    deductible_expense_total: float
    non_deductible_expense_total: float

    total_deductions: float
    net_profit: float
    taxable_income: float

    estimated_tax_owed: float
    estimated_tax_savings: float

    tax_method: str
    business_type: str

    largest_expense_category: str | None = None
    largest_expense_amount: float

    vehicle_expense_total: float

    deductible_breakdown: dict[str, DeductibleBreakdownItem]
    expense_breakdown: dict[str, ExpenseBreakdownItem]
    non_deductible_breakdown: dict[str, NonDeductibleBreakdownItem]