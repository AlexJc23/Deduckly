from datetime import datetime, time, timezone
import hashlib
import json
from sqlalchemy.exc import IntegrityError
from app.models.analytics_event import AnalyticsEvent
from sqlalchemy.orm import Session
from app.models import Trip
from app.models.enums import TripCategory
from app.schemas.v1.trip import TripCreate, TripUpdate
from app.services.income_service import upsert_income_for_trip
from fastapi import HTTPException
from decimal import Decimal

from app.services.mileage_rate_service import get_business_rate_for_date


def _creation_fingerprint(trip_in: TripCreate) -> str:
    # Addresses are best-effort enrichment and can differ between retries.
    values = trip_in.model_dump(exclude={"client_id", "start_address", "end_address"})
    for key, value in values.items():
        if isinstance(value, datetime):
            values[key] = value.replace(tzinfo=value.tzinfo or timezone.utc).astimezone(timezone.utc).isoformat()
        elif isinstance(value, Decimal):
            values[key] = str(value.normalize())
        elif hasattr(value, "value"):
            values[key] = value.value
    return hashlib.sha256(json.dumps(values, sort_keys=True).encode()).hexdigest()


def _existing_creation(db, user_id, client_id, fingerprint):
    if not client_id:
        return None
    trip = db.query(Trip).filter(Trip.user_id == user_id, Trip.client_id == client_id).first()
    if trip and trip.creation_fingerprint != fingerprint:
        raise HTTPException(status_code=409, detail="Client trip identity conflicts with an existing creation")
    return trip


def _trip_deduction(db, category, start_time, distance):
    if category == TripCategory.PERSONAL:
        return Decimal("0.00")
    rate = get_business_rate_for_date(db, start_time.date())
    return (distance * rate.business_rate).quantize(Decimal("0.01"))


def create_trip(db: Session, trip_in: TripCreate, user_id: int) -> Trip:
    if trip_in.distance_miles is None or trip_in.distance_miles <= 0:
        raise HTTPException(status_code=400, detail="Invalid distance")
    if trip_in.distance_miles > 1000:
        raise HTTPException(status_code=400, detail="Distance too large")

    fingerprint = _creation_fingerprint(trip_in)
    existing = _existing_creation(db, user_id, trip_in.client_id, fingerprint)
    if existing:
        return existing
    deduction = _trip_deduction(db, trip_in.category, trip_in.start_time, trip_in.distance_miles)
    values = trip_in.model_dump(exclude={"income_amount"})
    db_trip = Trip(**values, user_id=user_id, deduction_amount=deduction,
                   creation_fingerprint=fingerprint if trip_in.client_id else None)
    try:
        db.add(db_trip)
        db.flush()
        upsert_income_for_trip(db, trip_id=db_trip.id, user_id=user_id,
                               amount=trip_in.income_amount, commit=False)
        db.add(AnalyticsEvent(user_id=user_id, event_type="trip_created"))
        db.commit()
        db.refresh(db_trip)
        return db_trip
    except IntegrityError:
        db.rollback()
        # A concurrent retry may have won the unique constraint race.
        existing = _existing_creation(db, user_id, trip_in.client_id, fingerprint)
        if existing:
            return existing
        raise HTTPException(status_code=409, detail="Trip conflicts with an existing record")
    except Exception:
        db.rollback()
        raise


def get_trip(db: Session, trip_id: int, user_id: int) -> Trip:
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == user_id
    ).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    return trip


def get_trips_for_user(
    db,
    user_id: int,
    start_date=None,
    end_date=None,
    sort="desc"
) -> list[Trip]:

    query = db.query(Trip).filter(
        Trip.user_id == user_id
    )

    if start_date:
        start_dt = datetime.combine(start_date, time.min)
        query = query.filter(Trip.created_at >= start_dt)

    if end_date:
        end_dt = datetime.combine(end_date, time.max)
        query = query.filter(Trip.created_at <= end_dt)

    if sort == "asc":
        query = query.order_by(Trip.created_at.asc())
    else:
        query = query.order_by(Trip.created_at.desc())

    return query.all()


def get_daily_trip_breakdown(
    db: Session,
    user_id: int,
    start_of_day: datetime,
    start_of_next_day: datetime,
):
    trips = (
        db.query(Trip)
        .filter(
            Trip.user_id == user_id,
            Trip.category == TripCategory.BUSINESS,
            Trip.start_time >= start_of_day,
            Trip.start_time < start_of_next_day,
        )
        .order_by(Trip.start_time.asc())
        .all()
    )

    breakdown = {}

    for trip in trips:
        platform = trip.platform.value

        if platform not in breakdown:
            breakdown[platform] = {
                "platform": platform,
                "miles": Decimal("0"),
                "trip_count": 0,
            }

        breakdown[platform]["miles"] += trip.distance_miles
        breakdown[platform]["trip_count"] += 1

    return sorted(
        breakdown.values(),
        key=lambda item: (
            item["trip_count"],
            item["miles"],
        ),
        reverse=True,
    )


def update_trip(
    db: Session,
    trip_id: int,
    user_id: int,
    trip_in: TripUpdate
) -> Trip:

    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).with_for_update().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    update_data = trip_in.model_dump(exclude_unset=True)
    try:
        for field, value in update_data.items():
            if field == "income_amount":
                continue
            if value is None and field not in {"start_address", "end_address"}:
                raise HTTPException(status_code=400, detail=f"{field} cannot be null")
            setattr(trip, field, value)
        if trip.distance_miles is None or not 0 < trip.distance_miles <= 1000:
            raise HTTPException(status_code=400, detail="Invalid distance")
        if {"distance_miles", "category", "start_time"} & update_data.keys():
            trip.deduction_amount = _trip_deduction(db, trip.category, trip.start_time, trip.distance_miles)
        if "income_amount" in update_data:
            upsert_income_for_trip(db, trip_id=trip.id, user_id=user_id,
                                   amount=update_data["income_amount"], commit=False)
        db.commit()
        db.refresh(trip)
        return trip
    except Exception:
        db.rollback()
        raise


def delete_trip(
    db: Session,
    trip_id: int,
    user_id: int
) -> None:

    trip = get_trip(db, trip_id, user_id)
    db.delete(trip)

    try:
        db.commit()
        return {"message": "Trip deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete trip"
        ) from e