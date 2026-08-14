from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models import Income, Trip
from app.schemas.v1.income import IncomeCreate, IncomeUpdate
from fastapi import HTTPException
from decimal import Decimal
from datetime import datetime, time, timezone
from app.models.enums import IncomeType
from typing import Optional, List
from app.services.analytics_service import create_analytics_event

def _to_utc(dt: Optional[datetime]) -> datetime:
    if dt is None:
        return datetime.now(timezone.utc)

    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(timezone.utc)


def get_income(db: Session, income_id: int, user_id: int) -> Income:
    try:
        income = (
            db.query(Income)
            .filter(
                Income.id == income_id,
                Income.user_id == user_id,
            )
            .first()
        )
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Database error")

    if not income:
        raise HTTPException(status_code=404, detail="Income not found")

    return income


def get_incomes_for_user(
    db: Session,
    user_id: int,
    start_date=None,
    end_date=None,
    sort: str = "desc",
) -> List[Income]:

    if sort not in ("asc", "desc"):
        raise HTTPException(status_code=400, detail="Invalid sort value")

    try:
        query = db.query(Income).filter(
            Income.user_id == user_id
        )

        if start_date:
            start_dt = _to_utc(datetime.combine(start_date, time.min))
            query = query.filter(Income.received_at >= start_dt)

        if end_date:
            end_dt = _to_utc(datetime.combine(end_date, time.max))
            query = query.filter(Income.received_at <= end_dt)

        if sort == "asc":
            query = query.order_by(Income.received_at.asc())
        else:
            query = query.order_by(Income.received_at.desc())

        return query.all()

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch income",
        )


def create_income(
    db: Session,
    income_in: IncomeCreate,
    user_id: int,
) -> Income:

    if income_in.amount is None or income_in.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero",
        )

    if income_in.amount > Decimal("1000000"):
        raise HTTPException(
            status_code=400,
            detail="Amount too large",
        )

    received_at = _to_utc(income_in.received_at)
    now = datetime.now(timezone.utc)

    if received_at > now:
        raise HTTPException(
            status_code=400,
            detail="Received date cannot be in the future",
        )

    db_income = Income(
        user_id=user_id,
        amount=income_in.amount,
        source=income_in.source,
        platform=income_in.platform,
        business_name=income_in.business_name,
        received_at=received_at,
        notes=income_in.notes,
    )

    try:
        db.add(db_income)
        db.commit()
        db.refresh(db_income)

        create_analytics_event(
            db,
            event_type="income_created",
            user_id=user_id,
        )

        return db_income

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create income",
        )


def upsert_income_for_trip(
    db: Session,
    trip_id: int,
    user_id: int,
    amount: Optional[Decimal],
):

    trip = (
        db.query(Trip)
        .filter(
            Trip.id == trip_id,
            Trip.user_id == user_id,
        )
        .first()
    )

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    income = (
        db.query(Income)
        .filter(
            Income.trip_id == trip_id,
            Income.user_id == user_id,
        )
        .first()
    )

    if amount is None:
        if income:
            try:
                db.delete(income)
                db.commit()
            except SQLAlchemyError:
                db.rollback()
                raise HTTPException(
                    status_code=500,
                    detail="Failed to delete income",
                )

        return None

    if amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero",
        )

    if amount > Decimal("1000000"):
        raise HTTPException(
            status_code=400,
            detail="Amount too large",
        )

    try:
        if income:
            income.amount = amount
            income.platform = trip.platform
            income.received_at = trip.end_time
        else:
            income = Income(
                user_id=user_id,
                amount=amount,
                source=IncomeType.GIG_PLATFORM,
                platform=trip.platform,
                received_at=trip.end_time,
                trip_id=trip_id,
                notes=None,
            )
            db.add(income)

        db.commit()
        db.refresh(income)

        return income

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save trip income",
        )


def update_income(
    db: Session,
    income_id: int,
    user_id: int,
    income_in: IncomeUpdate,
) -> Income:

    income = get_income(db, income_id, user_id)

    if income_in.amount is not None:
        if income_in.amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="Amount must be greater than zero",
            )

        if income_in.amount > Decimal("1000000"):
            raise HTTPException(
                status_code=400,
                detail="Amount too large",
            )

        income.amount = income_in.amount

    if income_in.source is not None:
        income.source = income_in.source

        if income.source == IncomeType.GIG_PLATFORM:
            income.business_name = None

        if income.source == IncomeType.BUSINESS:
            income.platform = None
            income.trip_id = None

    if income_in.platform is not None:
        income.platform = income_in.platform

    if income_in.business_name is not None:
        income.business_name = income_in.business_name

    if income_in.notes is not None:
        income.notes = income_in.notes

    if income_in.received_at is not None:
        received_at = _to_utc(income_in.received_at)

        if received_at > datetime.now(timezone.utc):
            raise HTTPException(
                status_code=400,
                detail="Received date cannot be in the future",
            )

        income.received_at = received_at

    if income.source == IncomeType.GIG_PLATFORM and not income.platform:
        raise HTTPException(
            status_code=400,
            detail="Platform required for gig income",
        )

    if income.source == IncomeType.BUSINESS and not income.business_name:
        raise HTTPException(
            status_code=400,
            detail="Business name required for business income",
        )

    try:
        db.commit()
        db.refresh(income)
        return income

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update income",
        )


def delete_income(
    db: Session,
    income_id: int,
    user_id: int,
):
    income = get_income(db, income_id, user_id)

    if income.trip_id is not None:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete income associated with a trip",
        )

    try:
        db.delete(income)
        db.commit()

        return {
            "detail": "Income deleted successfully",
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete income",
        )