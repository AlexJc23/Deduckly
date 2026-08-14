from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from datetime import datetime

from app.db.base import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    event_type = Column(
        String,
        nullable=False,
        index=True,
    )

    event_metadata = Column(
        "metadata",
        JSON,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )