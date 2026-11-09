"""Report date entitlements and read-only month comparisons."""
from datetime import datetime, timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from fastapi import HTTPException
from sqlalchemy import func
from app.models import Income, Expense, Trip
from app.models.enums import TripCategory
from app.services.report_service import build_date_filters


def local_today(user):
    try:
        zone = ZoneInfo(getattr(user, "timezone", None) or "America/New_York")
    except (ZoneInfoNotFoundError, ValueError, TypeError):
        zone = ZoneInfo("America/New_York")
    return datetime.now(zone).date()


def allowed_period(user, premium, year=None, month=None, day=None,
                   start_date=None, end_date=None, vehicle_id=None):
    today = local_today(user)
    if not premium:
        if start_date or end_date or day is not None or vehicle_id:
            raise HTTPException(403, "Premium is required for historical, custom, daily and per-vehicle reports")
        if (year is not None or month is not None) and (year, month) != (today.year, today.month):
            raise HTTPException(403, "Free reports are limited to the current month")
        return today.year, today.month
    if year is None and month is None and not start_date and not end_date:
        return today.year, today.month
    return year, month


def monthly_comparison(db, user, year, month, vehicle_id=None):
    """Only summary totals for the preceding month; never historical detail access."""
    from datetime import date
    previous = date(year, month, 1) - timedelta(days=1)
    def total(model, amount, timestamp, business=False):
        filters = [model.user_id == user.id, *build_date_filters(
            timestamp, previous.year, previous.month, timezone_name=user.timezone)]
        if business:
            filters.append(Trip.category == TripCategory.BUSINESS)
        query = db.query(func.coalesce(func.sum(amount), 0))
        if vehicle_id:
            if model is Income:
                query = query.join(Trip, Income.trip_id == Trip.id)
                filters.extend([Trip.user_id == user.id, Trip.vehicle_id == vehicle_id])
            else:
                filters.append(model.vehicle_id == vehicle_id)
        return query.filter(*filters).scalar() or Decimal('0')
    return {
        "year": previous.year, "month": previous.month, "basis": "previous_calendar_month",
        "total_income": total(Income, Income.amount, Income.received_at),
        "total_expenses": total(Expense, Expense.amount, Expense.incurred_at),
        "total_miles": total(Trip, Trip.distance_miles, Trip.start_time, True),
    }
