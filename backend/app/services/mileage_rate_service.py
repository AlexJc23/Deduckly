from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from typing import List
from decimal import InvalidOperation

from app.models import MileageRate, User
from app.schemas.v1.mileage_rate import MileageRateCreate, MileageRateUpdate
from app.models.enums import UserRole

from datetime import date




def get_mileage_rates(db: Session, effective_date: int, user: User) -> List[MileageRate]:
    try:
        query = db.query(MileageRate)

        if effective_date is not None:
            query = query.filter(MileageRate.effective_date == effective_date)

        return query.order_by(MileageRate.effective_date.desc()).all()

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to fetch mileage rates")


def get_business_rate_for_date(
    db: Session,
    trip_date: date,
) -> MileageRate:
    mileage_rate = (
        db.query(MileageRate)
        .filter(MileageRate.effective_date <= trip_date)
        .order_by(MileageRate.effective_date.desc())
        .first()
    )

    if mileage_rate is None:
        raise HTTPException(
            status_code=404,
            detail=f"No mileage rate found for {trip_date}"
        )

    return mileage_rate

def create_mileage_rate(db: Session, rate_in: MileageRateCreate, user: User) -> MileageRate:
    try:
        if user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Only admins can manage mileage rates")

        existing = db.query(MileageRate).filter(MileageRate.effective_date == rate_in.effective_date).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Mileage rate for this effective_date already exists"
            )

        rate = MileageRate(
            effective_date=rate_in.effective_date,
            business_rate=rate_in.business_rate
        )

        db.add(rate)
        db.commit()
        db.refresh(rate)

        return rate

    except HTTPException:
        raise

    except (SQLAlchemyError, InvalidOperation):
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create mileage rate")


def update_mileage_rate(
    db: Session,
    rate_id: int,
    rate_in: MileageRateUpdate,
    user: User
) -> MileageRate:
    try:
        if user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=403,
                detail="Only admins can manage mileage rates"
            )

        rate = (
            db.query(MileageRate)
            .filter(MileageRate.id == rate_id)
            .first()
        )

        if not rate:
            raise HTTPException(
                status_code=404,
                detail="Mileage rate not found"
            )

        if rate_in.effective_date is not None:
            existing = (
                db.query(MileageRate)
                .filter(
                    MileageRate.effective_date == rate_in.effective_date,
                    MileageRate.id != rate_id,
                )
                .first()
            )

            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="Mileage rate for this effective_date already exists",
                )

            rate.effective_date = rate_in.effective_date

        if rate_in.business_rate is not None:
            rate.business_rate = rate_in.business_rate

        db.commit()
        db.refresh(rate)

        return rate

    except HTTPException:
        raise

    except (SQLAlchemyError, InvalidOperation):
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update mileage rate",
        )

def delete_mileage_rate(db: Session, rate_id: int, user: User):
    try:
        if user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Only admins can manage mileage rates")

        rate = db.query(MileageRate).filter(MileageRate.id == rate_id).first()

        if not rate:
            raise HTTPException(status_code=404, detail="Mileage rate not found")

        db.delete(rate)
        db.commit()

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete mileage rate")
