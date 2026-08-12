from sqlalchemy.orm import Session

from app.models.security_event import SecurityEvent


def create_security_event(
    db: Session,
    *,
    event_type: str,
    user_id: int | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    metadata: dict | None = None,
) -> SecurityEvent:
    event = SecurityEvent(
        user_id=user_id,
        event_type=event_type,
        ip_address=ip_address,
        user_agent=user_agent,
        event_metadata=metadata,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event