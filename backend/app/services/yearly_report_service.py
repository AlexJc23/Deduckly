from calendar import month
from typing import Optional

from app.models.milage_rate import MileageRate
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from fastapi import HTTPException
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone

from app.models import TaxBracket, User, Expense, Income, Trip


def generate_tax_report(
    db: Session,
    user: User,
    year: int,
    month: Optional[int] = None
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

        total_expenses = (
            db.query(func.sum(Expense.amount))
            .filter(*expense_filters)
            .scalar()
            or Decimal("0")
        )

        # 🚗 trip filters
        trip_filters = [
            Trip.user_id == user.id,
            func.extract("year", Trip.created_at) == year,
        ]

        if month is not None:
            trip_filters.append(
                func.extract("month", Trip.created_at) == month
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
            total_miles += Decimal(trip.distance_miles)

            # Load all mileage rates once
        mileage_rates = (
            db.query(MileageRate)
            .order_by(MileageRate.effective_date.asc())
            .all()
        )

        if not mileage_rates:
            raise HTTPException(
                status_code=404,
                detail="No mileage rates found."
            )

        total_miles = Decimal("0")
        mileage_deduction = Decimal("0")

        for trip in trips:
            trip_date = trip.created_at.date()
            total_miles += Decimal(str(trip.distance_miles))

            applicable_rate = None

            for rate in mileage_rates:
                if rate.effective_date <= trip_date:
                    applicable_rate = rate
                else:
                    break

            if applicable_rate is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"No mileage rate found for {trip_date}"
                )

            mileage_deduction += (
                Decimal(str(trip.distance_miles))
                * applicable_rate.business_rate
            )
        total_income = Decimal(total_income)
        total_expenses = Decimal(total_expenses)

        # 🧾 deductions
        total_deductions = total_expenses + mileage_deduction

        # 📉 profit
        net_profit = total_income - total_expenses
        taxable_income = max(
            net_profit - mileage_deduction,
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
            "first_name": getattr(user, "first_name", "N/A"),
            "last_name": getattr(user, "last_name", "N/A"),
            "filing_status": user.filing_status,
            "generated_at": datetime.now(timezone.utc),

            "total_income": total_income,
            "total_expenses": total_expenses,

            "total_miles": total_miles,
            "mileage_deduction": mileage_deduction,

            "total_deductions": total_deductions,
            "net_profit": net_profit,
            "taxable_income": taxable_income,
            "tax_owed": tax_owed,
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