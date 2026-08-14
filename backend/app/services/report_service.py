from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from fastapi import HTTPException
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone, date, timedelta

from app.models import TaxBracket, User, Expense, Income, Trip
from app.models.enums import TaxMethod, ExpenseCategory
from app.services.analytics_service import create_analytics_event


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


def calculate_expense_summary(
    user: User,
    expenses: list[Expense],
    mileage_deduction: Decimal,
):
    deductible_expense_total = Decimal("0")
    non_deductible_expense_total = Decimal("0")
    vehicle_expense_total = Decimal("0")

    expense_breakdown = {}
    deductible_breakdown = {}
    non_deductible_breakdown = {}

    largest_expense_category = None
    largest_expense_amount = Decimal("0")

    for expense in expenses:

        raw_amount = expense.amount
        business_amount = deductible_amount(expense)

        category = expense.category.value

        # Finance breakdown (actual money spent)
        expense_breakdown.setdefault(
            category,
            {
                "amount": Decimal("0"),
                "count": 0,
                "business_percentage": expense.business_percentage,
            },
        )

        expense_breakdown[category]["amount"] += raw_amount
        expense_breakdown[category]["count"] += 1

        if expense_breakdown[category]["amount"] > largest_expense_amount:
            largest_expense_amount = expense_breakdown[category]["amount"]
            largest_expense_category = category

        rule = CATEGORY_RULES.get(expense.category)

        if rule is None:
            continue

        if rule["vehicle"]:
            vehicle_expense_total += business_amount

        if user.tax_method == TaxMethod.STANDARD_MILEAGE:

            if rule["standard"]:
                deductible_expense_total += business_amount

                deductible_breakdown.setdefault(
                    category,
                    {
                        "amount": Decimal("0"),
                        "count": 0,
                    },
                )

                deductible_breakdown[category]["amount"] += business_amount
                deductible_breakdown[category]["count"] += 1

            else:
                non_deductible_expense_total += business_amount

                non_deductible_breakdown.setdefault(
                    category,
                    {
                        "amount": Decimal("0"),
                        "count": 0,
                        "reason": "Included in the Standard Mileage deduction.",
                    },
                )

                non_deductible_breakdown[category]["amount"] += business_amount
                non_deductible_breakdown[category]["count"] += 1

        else:  # ACTUAL_EXPENSES

            if rule["actual"]:
                deductible_expense_total += business_amount

                deductible_breakdown.setdefault(
                    category,
                    {
                        "amount": Decimal("0"),
                        "count": 0,
                    },
                )

                deductible_breakdown[category]["amount"] += business_amount
                deductible_breakdown[category]["count"] += 1

            else:
                non_deductible_expense_total += business_amount

                non_deductible_breakdown.setdefault(
                    category,
                    {
                        "amount": Decimal("0"),
                        "count": 0,
                        "reason": "Not deductible.",
                    },
                )

                non_deductible_breakdown[category]["amount"] += business_amount
                non_deductible_breakdown[category]["count"] += 1

    return {
        "deductible_expense_total": deductible_expense_total,
        "non_deductible_expense_total": non_deductible_expense_total,
        "vehicle_expense_total": vehicle_expense_total,
        "expense_breakdown": expense_breakdown,
        "deductible_breakdown": deductible_breakdown,
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

def build_date_filters(
    column,
    year: Optional[int] = None,
    month: Optional[int] = None,
    day: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    filters = []

    if start_date and end_date:
        filters.append(column >= start_date)
        filters.append(column < (end_date + timedelta(days=1)))
        return filters

    if year is not None:
        filters.append(func.extract("year", column) == year)

    if month is not None:
        filters.append(func.extract("month", column) == month)

    if day is not None:
        filters.append(func.extract("day", column) == day)

    return filters

def generate_tax_report(
    db: Session,
    user: User,
    year: Optional[int] = None,
    month: Optional[int] = None,
    day: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    try:
        # 💰 income filters
        income_filters = [
            Income.user_id == user.id,
            *build_date_filters(
                Income.received_at,
                year,
                month,
                day,
                start_date,
                end_date,
            ),
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


        if (
            start_date
            and end_date
            and start_date.year != end_date.year
        ):
            raise HTTPException(
                status_code=400,
                detail="Custom reports cannot span multiple tax years."
            )

        report_year = year

        if report_year is None and start_date:
            report_year = start_date.year

        # 💸 expense filters
        expense_filters = [
            Expense.user_id == user.id,
            *build_date_filters(
                Expense.incurred_at,
                year,
                month,
                day,
                start_date,
                end_date,
            ),
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
            *build_date_filters(
                Trip.created_at,
                year,
                month,
                day,
                start_date,
                end_date,
            ),
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

        deductions = calculate_expense_summary(
            user=user,
            expenses=expenses,
            mileage_deduction=mileage_deduction,
        )

        deductible_expense_total = deductions["deductible_expense_total"]
        non_deductible_expense_total = deductions["non_deductible_expense_total"]
        vehicle_expense_total = deductions["vehicle_expense_total"]
        expense_breakdown = deductions["expense_breakdown"]
        non_deductible_breakdown = deductions["non_deductible_breakdown"]
        largest_expense_category = deductions["largest_expense_category"]
        largest_expense_amount = deductions["largest_expense_amount"]
        deductible_breakdown = deductions["deductible_breakdown"]

        if user.tax_method == TaxMethod.STANDARD_MILEAGE:
            total_deductions = (
                deductible_expense_total +
                mileage_deduction
            )
        else:
            total_deductions = deductible_expense_total

        # 📉 profit
        net_profit = total_income - total_deductions

        # 💵 taxable income
        taxable_income = max(
            net_profit,
            Decimal("0")
        )

        report_year = year

        if report_year is None and start_date:
            report_year = start_date.year

        # 🧮 tax calculation
        tax_brackets = (
            db.query(TaxBracket)
            .filter(
                TaxBracket.year == report_year,
                TaxBracket.filing_status == user.filing_status,
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
            "year": report_year,
            "month": month,
            "day": day,
            "start_date": start_date,
            "end_date": end_date,
            "first_name": getattr(user, "first_name", "N/A"),
            "last_name": getattr(user, "last_name", "N/A"),
            "filing_status": user.filing_status,
            "generated_at_utc": datetime.now(timezone.utc),

            "total_income": total_income,
            "total_expenses": total_expenses,

            "total_miles": total_miles,
            "mileage_deduction": mileage_deduction,

            "deductible_expense_total": deductible_expense_total,
            "non_deductible_expense_total": non_deductible_expense_total,
            "deductible_breakdown": deductible_breakdown,

            "total_deductions": total_deductions,
            "net_profit": net_profit,
            "taxable_income": taxable_income,
            "estimated_tax_owed": tax_owed,
            "estimated_tax_savings": estimated_tax_savings,
            "tax_method": user.tax_method,
            "business_type": user.business_type,
            "largest_expense_category": largest_expense_category,
            "largest_expense_amount": largest_expense_amount,


            "vehicle_expense_total": vehicle_expense_total,
            "expense_breakdown": expense_breakdown,
            "non_deductible_breakdown": non_deductible_breakdown,
        }

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    except InvalidOperation:
        raise HTTPException(
            status_code=500,
            detail="Decimal calculation error"
        )


def get_current_month_income(
    db: Session,
    user: User,
) -> Decimal:
    now = datetime.now()

    total = (
        db.query(
            func.coalesce(
                func.sum(Income.amount),
                Decimal("0.00"),
            )
        )
        .filter(
            Income.user_id == user.id,
            func.extract("year", Income.received_at) == now.year,
            func.extract("month", Income.received_at) == now.month,
        )
        .scalar()
    )

    return total