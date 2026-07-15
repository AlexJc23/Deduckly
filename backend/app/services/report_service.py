from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from fastapi import HTTPException
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone

from app.models import TaxBracket, User, Expense, Income, Trip
from app.models.enums import TaxMethod, ExpenseCategory

STANDARD_MILEAGE_EXCLUDED = {
    ExpenseCategory.FUEL,
    ExpenseCategory.VEHICLE_MAINTENANCE,
    ExpenseCategory.CAR_WASH,
    ExpenseCategory.VEHICLE_INSURANCE,
    ExpenseCategory.VEHICLE_REGISTRATION,
    ExpenseCategory.REPAIRS_MAINTENANCE,
}
expense_breakdown = {
    "fuel": Decimal("0"),
    "software": Decimal("0"),
    "parking": Decimal("0"),
    "advertising": Decimal("0"),
}


def deductible_amount(expense: Expense) -> Decimal:
    percentage = Decimal(str(expense.business_percentage)) / Decimal("100")

    return (
        Decimal(str(expense.amount))
        * percentage
    ).quantize(Decimal("0.01"))


def calculate_deductions(
    user: User,
    expenses: list[Expense],
    mileage_deduction: Decimal,
):
    deductible_expenses = Decimal("0")
    non_deductible_expenses = Decimal("0")
    vehicle_expenses = Decimal("0")
    expense_breakdown = {}

    for expense in expenses:

        amount = deductible_amount(expense)

        category = expense.category.value

        expense_breakdown.setdefault(
            category,
            Decimal("0")
        )

        expense_breakdown[category] += amount

        if expense.category in VEHICLE_EXPENSE_CATEGORIES:
            vehicle_expenses += amount

        if user.tax_method == TaxMethod.STANDARD_MILEAGE:

            if expense.category in STANDARD_MILEAGE_EXCLUDED:
                non_deductible_expenses += amount
            else:
                deductible_expenses += amount

        elif user.tax_method == TaxMethod.ACTUAL_EXPENSES:

            deductible_expenses += amount

    # Mileage deduction only applies under Standard Mileage
    if user.tax_method == TaxMethod.STANDARD_MILEAGE:
        deductible_expenses += mileage_deduction

    return {
        "deductible_expenses": deductible_expenses,
        "non_deductible_expenses": non_deductible_expenses,
        "vehicle_expenses": vehicle_expenses,
        "expense_breakdown": expense_breakdown,
    }



def generate_tax_report(
    db: Session,
    user: User,
    year: int,
    month: Optional[int] = None,
    day: Optional[int] = None
):
    try:
        # 💰 income filters
        income_filters = [
            Income.user_id == user.id,
            func.extract("year", Income.received_at) == year,
        ]

        if month is not None:
            income_filters.append(
                func.extract("month", Income.received_at) == month
            )

        if day is not None:
            income_filters.append(
                func.extract("day", Income.received_at) == day
            )

        total_income = (
            db.query(func.sum(Income.amount))
            .filter(*income_filters)
            .scalar()
            or Decimal("0")
        )

        # 💸 expense filters
        expense_filters = [
            Expense.user_id == user.id,
            func.extract("year", Expense.incurred_at) == year,
        ]

        if month is not None:
            expense_filters.append(
                func.extract("month", Expense.incurred_at) == month
            )

        if day is not None:
            expense_filters.append(
                func.extract("day", Expense.incurred_at) == day
            )

        expenses = (
            db.query(Expense)
            .filter(*expense_filters)
            .all()
        )
        total_expenses = Decimal("0")

        for expense in expenses:
            total_expenses += Decimal(str(expense.amount))

        # 🚗 trip filters
        trip_filters = [
            Trip.user_id == user.id,
            func.extract("year", Trip.created_at) == year,
        ]

        if month is not None:
            trip_filters.append(
                func.extract("month", Trip.created_at) == month
            )

        if day is not None:
            trip_filters.append(
                func.extract("day", Trip.incurred_at) == day
            )
        
        trips = (
            db.query(Trip)
            .filter(*trip_filters)
            .order_by(Trip.created_at.asc())
            .all()
        )

        total_miles = Decimal("0")
        mileage_deduction = Decimal("0")

        for trip in trips:
            total_miles += Decimal(str(trip.distance_miles))
            mileage_deduction += Decimal(str(trip.deduction_amount or 0))

        total_income = Decimal(total_income)
        total_expenses = Decimal(total_expenses)

        deductible_expenses, non_deductible_expenses = calculate_deductions(
            user=user,
            expenses=expenses,
            mileage_deduction=mileage_deduction,
        )

        total_deductions = deductible_expenses

        # 📉 profit
        net_profit = total_income - total_deductions

        # 💵 taxable income
        taxable_income = max(
            net_profit,
            Decimal("0")
        )

        # 🧮 tax calculation
        tax_brackets = (
            db.query(TaxBracket)
            .filter(
                TaxBracket.year == year,
                TaxBracket.filing_status == user.filing_status
            )
            .order_by(TaxBracket.min_income.asc())
            .all()
        )

        if not tax_brackets:
            raise HTTPException(
                status_code=404,
                detail="No tax brackets found"
            )

        tax_owed = Decimal("0")
        remaining_income = taxable_income

        for bracket in tax_brackets:
            if remaining_income <= 0:
                break

            lower = bracket.min_income
            upper = bracket.max_income or Decimal("Infinity")
            span = upper - lower

            taxable_in_bracket = min(
                remaining_income,
                span
            )

            tax_owed += taxable_in_bracket * bracket.rate
            remaining_income -= taxable_in_bracket

        return {
            "year": year,
            "month": month,
            "day": day,
            "first_name": getattr(user, "first_name", "N/A"),
            "last_name": getattr(user, "last_name", "N/A"),
            "filing_status": user.filing_status,
            "generated_at": datetime.now(timezone.utc),

            "total_income": total_income,
            "total_expenses": total_expenses,

            "total_miles": total_miles,
            "mileage_deduction": mileage_deduction,

            "deductible_expenses": deductible_expenses,
            "non_deductible_expenses": non_deductible_expenses,

            "total_deductions": total_deductions,
            "net_profit": net_profit,
            "taxable_income": taxable_income,
            "tax_owed": tax_owed,

            "total_expenses": total_expenses,

            "deductible_expenses": deductible_expenses,

            "non_deductible_expenses": non_deductible_expenses,

            "mileage_deduction": mileage_deduction,

            "total_deductions": total_deductions,
        }

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    except InvalidOperation:
        raise HTTPException(
            status_code=500,
            detail="Decimal calculation error"
        )