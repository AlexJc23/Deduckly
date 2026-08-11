from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models import User
from app.schemas.v1.user import UserCreate, UserUpdate
from app.core.security import hash_password, verify_password
from fastapi import HTTPException, status
from typing import Optional
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from zoneinfo import ZoneInfo

from sqlalchemy import func


from app.models import Income

ALLOWED_USER_UPDATE_FIELDS = [
    "filing_status",
    "business_type",
    "tax_method",
    "monthly_income_goal",
    "weekly_income_goal",
    "cost_per_mile",
    "minimum_profit",
    "minimum_hourly_rate",
    "minimum_dollars_per_mile",
    "preferred_max_distance",
    "default_platform",
    "timezone",
    "currency",
    "distance_unit",
    "week_starts_on",
    "notifications_enabled",
    "trip_reminders_enabled",
    "goal_reminders_enabled",
    "auto_trip_detection",
]

def create_user(db: Session, user_in: UserCreate) -> User:
    try:
        existing_user = get_user_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        db_user = User(
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            email=user_in.email,
            hashed_password=hash_password(user_in.password),
            is_active=True,
            email_verified=False,
            filing_status=user_in.filing_status,
            business_type=user_in.business_type,
            tax_method=user_in.tax_method,
            role=user_in.role,
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


def get_user(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if not user:
        return None, "invalid_credentials"

    if user.hashed_password is None:
        return None, "oauth_account"

    if not verify_password(password, user.hashed_password):
        return None, "invalid_credentials"

    return user, "success"


def update_user(
    db: Session,
    user_id: int,
    user_in: UserUpdate,
) -> User:
    try:
        user = get_user(db, user_id)

        # -------------------------------------------------
        # Profile
        # -------------------------------------------------

        if user_in.first_name is not None:
            user.first_name = user_in.first_name

        if user_in.last_name is not None:
            user.last_name = user_in.last_name

        

        if user_in.password is not None:
            user.hashed_password = hash_password(
                user_in.password
            )

        # -------------------------------------------------
        # Automatically update simple fields
        # -------------------------------------------------


        for field in ALLOWED_USER_UPDATE_FIELDS:
            value = getattr(user_in, field)

            if value is not None:
                setattr(user, field, value)
        db.commit()

        db.refresh(user)

        return user

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise

def get_weekly_income(
    db: Session,
    user_id: int,
) -> Decimal:
    """
    Returns the total income earned during the current week
    (Monday through today).
    """
    tz = ZoneInfo("America/New_York")
    now = datetime.now(tz)


    start_of_week = (
        now - timedelta(days=now.weekday())
    ).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )



    total = (
        db.query(
            func.coalesce(
                func.sum(Income.amount),
                0,
            )
        )
        .filter(
            Income.user_id == user_id,
            Income.received_at >= start_of_week,
        )
        .scalar()
    )



    incomes = (
        db.query(Income)
        .filter(
            Income.user_id == user_id,
            Income.received_at >= start_of_week,
        )
        .all()
    )

    return Decimal(total)

def get_monthly_income(
    db: Session,
    user_id: int,
) -> Decimal:
    tz = ZoneInfo("America/New_York")
    now = datetime.now(tz)

    start_of_month = now.replace(
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    total = (
        db.query(
            func.coalesce(
                func.sum(Income.amount),
                0,
            )
        )
        .filter(
            Income.user_id == user_id,
            Income.received_at >= start_of_month,
        )
        .scalar()
    )

    return Decimal(total)

def delete_user(db: Session, user_id: int) -> None:
    try:
        user = get_user(db, user_id)

        db.delete(user)
        db.commit()

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )