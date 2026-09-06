from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from app.db.base import Base


class NotificationOccurrence(Base):
    __tablename__ = "notification_occurrences"
    __table_args__ = (UniqueConstraint("user_id", "kind", "period", name="uq_notification_occurrence"),)
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    kind = Column(String(32), nullable=False)
    period = Column(String(10), nullable=False)
    claimed_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(16), nullable=False, default="claimed")
    push_token = Column(String(255), nullable=True)
    ticket_id = Column(String(128), nullable=True)
