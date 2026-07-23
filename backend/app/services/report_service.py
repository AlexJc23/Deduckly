from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from fastapi import HTTPException
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone

from app.models import TaxBracket, User, Expense, Income, Trip
from app.models.enums import TaxMethod, ExpenseCategory

CATEGORY_RULES = {
    # Vehicle
    ExpenseCategory.FUEL: {"standard": False, "actual": True, "vehicle": True},
    ExpenseCategory.CAR_WASH: {"standard": False, "actual": True, "vehicle": True},
    ExpenseCategory.VEHICLE_MAINTENANCE: {"standard": False, "actual": True, "vehicle": True},
    ExpenseCategory.VEHICLE_REPAIRS: {"standard": False, "actual": True, "vehicle": True},
    ExpenseCategory.VEHICLE_INSURANCE: {"standard": False, "actual": True, "vehicle": True},
    ExpenseCategory.VEHICLE_REGISTRATION: {"standard": False, "actual": True, "vehicle": True},
    ExpenseCategory.VEHICLE: {"standard": False, "actual": True, "vehicle": True},

    # Parking & Tolls
    ExpenseCategory.PARKING_TOLLS: {"standard": True, "actual": True, "vehicle": False},

    # Office
    ExpenseCategory.SOFTWARE: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.PHONE: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.INTERNET: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.OFFICE_SUPPLIES: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.EQUIPMENT: {"standard": True, "actual": True, "vehicle": False},

    # Business
    ExpenseCategory.ADVERTISING: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.MARKETING: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.BANK_FEES: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.COMMISSIONS_FEES: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.CONTRACT_LABOR: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.PROFESSIONAL_SERVICES: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.LEGAL_FEES: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.ACCOUNTING: {"standard": True, "actual": True, "vehicle": False},

    # Travel
    ExpenseCategory.TRAVEL: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.LODGING: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.AIRFARE: {"standard": True, "actual": True, "vehicle": False},

    # Property
    ExpenseCategory.RENT: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.UTILITIES: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.HOME_OFFICE: {"standard": True, "actual": True, "vehicle": False},

    # Insurance
    ExpenseCategory.INSURANCE: {"standard": True, "actual": True, "vehicle": False},

    # Misc
    ExpenseCategory.LICENSES_PERMITS: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.POSTAGE_SHIPPING: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.INTEREST: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.TAXES_FEES: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.MEMBERSHIPS_SUBSCRIPTIONS: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.REPAIRS_MAINTENANCE: {"standard": True, "actual": True, "vehicle": False},
    ExpenseCategory.EDUCATION: {"standard": True, "actual": True, "vehicle": False},

    # Skip meals for MVP
    ExpenseCategory.MEALS: {"standard": False, "actual": False, "vehicle": False},

    ExpenseCategory.OTHER: {"standard": True, "actual": True, "vehicle": False},
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
    non_deductible_breakdown = []

    largest_expense_category = None
    largest_expense_amount = Decimal("0")

    for expense in expenses:

        amount = deductible_amount(expense)

        category = expense.category.value

        expense_breakdown.setdefault(
            category,
            {
                "amount": Decimal("0"),
                "count": 0,
                "business_percentage": expense.business_percentage,
            }
        )
        

        expense_breakdown[category]["amount"] += amount
        expense_breakdown[category]["count"] += 1

        if (
            expense_breakdown[category]["amount"]
            > largest_expense_amount
        ):
            largest_expense_amount = expense_breakdown[category]["amount"]
            largest_expense_category = category


        rule = CATEGORY_RULES.get(expense.category)

        if rule is None:
            continue

        if rule["vehicle"]:
            vehicle_expenses += amount

        if user.tax_method == TaxMethod.STANDARD_MILEAGE:

            if rule["standard"]:
                deductible_expenses += amount
            else:
                non_deductible_expenses += amount

                non_deductible_breakdown.append({
                    "category": category,
                    "amount": amount,
                    "reason": "Included in the Standard Mileage deduction."
                })

        else:  # ACTUAL_EXPENSES

            if rule["actual"]:
                deductible_expenses += amount
            else:
                non_deductible_expenses += amount

                non_deductible_breakdown.append({
                    "category": category,
                    "amount": amount,
                    "reason": "Not deductible."
                })

    if user.tax_method == TaxMethod.STANDARD_MILEAGE:
        deductible_expenses += mileage_deduction

    return {
        "deductible_expenses": deductible_expenses,
        "non_deductible_expenses": non_deductible_expenses,
        "vehicle_expenses": vehicle_expenses,
        "expense_breakdown": expense_breakdown,
        "non_deductible_breakdown": non_deductible_breakdown,
        "largest_expense_category": largest_expense_category,
        "largest_expense_amount": largest_expense_amount,
    }

def calculate_tax(
    taxable_income: Decimal,
    tax_brackets: list[TaxBracket],
) -> Decimal:

    tax = Decimal("0")
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

        tax += taxable_in_bracket * bracket.rate
        remaining_income -= taxable_in_bracket

    return tax.quantize(Decimal("0.01"))

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
                func.extract("day", Trip.created_at) == day
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

        deductions = calculate_deductions(
            user=user,
            expenses=expenses,
            mileage_deduction=mileage_deduction,
        )

        deductible_expenses = deductions["deductible_expenses"]
        non_deductible_expenses = deductions["non_deductible_expenses"]
        vehicle_expenses = deductions["vehicle_expenses"]
        expense_breakdown = deductions["expense_breakdown"]
        non_deductible_breakdown = deductions["non_deductible_breakdown"]
        largest_expense_category = deductions["largest_expense_category"]
        largest_expense_amount = deductions["largest_expense_amount"]

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

        tax_owed = calculate_tax(
            taxable_income,
            tax_brackets,
        )


        tax_without_deductions = calculate_tax(
            total_income,
            tax_brackets,
        )

        estimated_tax_savings = (
            tax_without_deductions - tax_owed
        ).quantize(Decimal("0.01"))

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
            "estimated_tax_savings": estimated_tax_savings,
            "tax_method": user.tax_method,
            "business_type": user.business_type,
            "largest_expense_category": largest_expense_category,
            "largest_expense_amount": largest_expense_amount,


            "vehicle_expenses": vehicle_expenses,
            "expense_breakdown": expense_breakdown,
            "non_deductible_breakdown": non_deductible_breakdown,
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