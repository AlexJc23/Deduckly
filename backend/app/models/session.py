# app/models/session.py

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from datetime import datetime
from app.db.base import Base
from sqlalchemy.orm import relationship


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    refresh_token = Column(String, unique=True, nullable=False, index=True)

    is_revoked = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    
    user = relationship(
    "User",
    back_populates="sessions"
    )
