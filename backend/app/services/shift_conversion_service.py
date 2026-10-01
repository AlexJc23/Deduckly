"""One transactional conversion path for manual intent and local-midnight catch-up."""
from datetime import datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from fastapi import HTTPException
from sqlalchemy.orm import lazyload
from app.models import User, Shift, ShiftSegment, Trip
from app.models.enums import TripCategory
from app.services.trip_service import _trip_deduction


def aware(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


def convert_pending(db, owner, now=None):
    now = now or datetime.now(timezone.utc)
    try:
        # Same lock order as snapshot writes/account deletion. Serializes the
        # catch-up against manual saves and against edits on another device.
        user = db.query(User).options(lazyload("*")).filter_by(id=owner).with_for_update().populate_existing().first()
        if not user or not user.is_active:
            raise HTTPException(401, 'Account unavailable')
        try:
            zone = ZoneInfo(user.timezone or 'America/New_York')
        except (ZoneInfoNotFoundError, ValueError):
            zone = ZoneInfo('America/New_York')
        today = aware(now).astimezone(zone).date()
        segments = (db.query(ShiftSegment).join(Shift).filter(Shift.user_id == owner,
            ShiftSegment.converted_at.is_(None), ShiftSegment.excluded.is_(False),
            ShiftSegment.ended_at.isnot(None)).order_by(ShiftSegment.id).with_for_update().all())
        result = []; blocked = []
        for segment in segments:
            due = aware(segment.started_at).astimezone(zone).date() < today
            if not (due or (segment.save_requested and segment.reviewed)):
                continue
            if not 0 < segment.distance_miles <= 1000:
                blocked.append(segment.client_id); continue
            # Do not double count a drive already recorded manually/Siri.
            if db.query(Trip.id).filter(Trip.user_id == owner, Trip.start_time < segment.ended_at,
                Trip.end_time > segment.started_at).first():
                blocked.append(segment.client_id); continue
            category = segment.category if segment.reviewed else TripCategory.BUSINESS
            platform = segment.platform_session.platform if segment.platform_session else None
            trip = Trip(user_id=owner, client_id=f'shift-segment-{segment.id}',
                start_time=segment.started_at, end_time=segment.ended_at,
                start_lat=None, start_lng=None, end_lat=None, end_lng=None,
                start_address=None, end_address=None, category=category, platform=platform,
                distance_miles=segment.distance_miles,
                deduction_amount=_trip_deduction(db, category, aware(segment.started_at), segment.distance_miles))
            db.add(trip); db.flush()
            segment.trip_id = trip.id
            segment.converted_at = now
            segment.category = category
            result.append(trip.id)
        db.commit()
        return {'created_trip_ids': result, 'blocked_segment_ids': blocked, 'blocked_segments': [
            {'shift_client_id': s.shift.client_id, 'client_id': s.client_id} for s in segments if s.client_id in blocked]}
    except Exception:
        db.rollback()
        raise
