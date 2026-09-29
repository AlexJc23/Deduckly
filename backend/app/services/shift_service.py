"""Atomic, owner-scoped snapshot synchronization; never writes Trip/report data."""
import hashlib
import json
from datetime import timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session, lazyload
from app.models import User, Shift, ShiftPlatformSession, ShiftSegment
from app.schemas.v1.shift import ShiftSnapshot


def get_shift(db, owner, client_id):
    row = db.query(Shift).filter_by(user_id=owner, client_id=client_id).first()
    if not row:
        raise HTTPException(404, 'Shift not found')
    return row


def snapshot(row):
    def iso(value):
        return value.replace(tzinfo=timezone.utc) if value and value.tzinfo is None else value
    sessions = {p.id: p.client_id for p in row.platform_sessions}
    def period(item):
        return dict(client_id=item.client_id, started_at=iso(item.started_at), ended_at=iso(item.ended_at))
    return ShiftSnapshot(**period(row), revision=row.revision, planned_end_at=iso(row.planned_end_at),
        platform_sessions=[dict(**period(p), platform=p.platform) for p in sorted(row.platform_sessions, key=lambda x: (iso(x.started_at), x.client_id))],
        segments=[dict(**period(s), distance_miles=s.distance_miles, category=s.category,
            excluded=s.excluded, platform_client_id=sessions.get(s.platform_session_id)) for s in sorted(row.segments, key=lambda x: (iso(x.started_at), x.client_id))])


def sync_shift(db: Session, owner: int, data: ShiftSnapshot):
    # User lock serializes same-owner creates (including competing new IDs).
    try:
        user = db.query(User).options(lazyload("*")).filter_by(id=owner).with_for_update().populate_existing().first()
        if not user or not user.is_active:
            raise HTTPException(401, 'Account unavailable')
        canonical = data.model_dump(mode='json')
        for field in ('platform_sessions', 'segments'):
            canonical[field].sort(key=lambda item: item['client_id'])
        digest = hashlib.sha256(json.dumps(canonical, sort_keys=True).encode()).hexdigest()
        row = db.query(Shift).filter_by(user_id=owner, client_id=data.client_id).with_for_update().populate_existing().first()
        if row and row.revision == data.revision and row.sync_fingerprint == digest:
            result = snapshot(row)
            db.commit()
            return result
        if data.revision != (row.revision + 1 if row else 1):
            raise HTTPException(409, 'Shift revision conflict')
        if row:
            old = snapshot(row)
            if old.started_at != data.started_at or (old.ended_at and old.ended_at != data.ended_at):
                raise HTTPException(409, 'Shift lifecycle conflict')
            for name in ('platform_sessions', 'segments'):
                before = {p.client_id: p for p in getattr(old, name)}
                after = {p.client_id: p for p in getattr(data, name)}
                if not before.keys() <= after.keys():
                    raise HTTPException(409, 'Saved records cannot be removed; exclude segments instead')
                for key, value in before.items():
                    updated = after[key]
                    if value.started_at != updated.started_at or (value.ended_at and value.ended_at != updated.ended_at):
                        raise HTTPException(409, 'Child lifecycle conflict')
                    if name == 'platform_sessions' and value.platform != updated.platform:
                        raise HTTPException(409, 'Platform history cannot be rewritten')
        if data.ended_at is None and db.query(Shift).filter(Shift.user_id == owner, Shift.ended_at.is_(None), Shift.client_id != data.client_id).first():
            raise HTTPException(409, 'Another shift is active')
        if row is None:
            row = Shift(user_id=owner, client_id=data.client_id, started_at=data.started_at)
            db.add(row)
            db.flush()
        row.ended_at, row.planned_end_at = data.ended_at, data.planned_end_at
        periods = {p.client_id: p for p in row.platform_sessions}
        for p in data.platform_sessions:
            target = periods.get(p.client_id)
            if target is None:
                target = ShiftPlatformSession(shift_id=row.id, client_id=p.client_id, started_at=p.started_at, platform=p.platform)
                db.add(target)
                periods[p.client_id] = target
            target.ended_at = p.ended_at
        db.flush()
        segments = {s.client_id: s for s in row.segments}
        for s in data.segments:
            target = segments.get(s.client_id)
            if target is None:
                target = ShiftSegment(shift_id=row.id, client_id=s.client_id, started_at=s.started_at)
                db.add(target)
            target.ended_at, target.distance_miles = s.ended_at, s.distance_miles
            target.category, target.excluded = s.category, s.excluded
            target.platform_session_id = periods[s.platform_client_id].id if s.platform_client_id else None
        row.revision, row.sync_fingerprint = data.revision, digest
        db.flush()
        db.expire(row, ['segments', 'platform_sessions'])
        result = snapshot(row)
        db.commit()
        return result
    except Exception:
        db.rollback()
        raise
