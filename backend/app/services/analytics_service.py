from sqlalchemy.orm import Session

from app.models.analytics_event import AnalyticsEvent


def create_analytics_event(
    db: Session,
    *,
    event_type: str,
    user_id: int | None = None,
    metadata: dict | None = None,
) -> AnalyticsEvent:
    event = AnalyticsEvent(
        user_id=user_id,
        event_type=event_type,
        event_metadata=metadata,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event