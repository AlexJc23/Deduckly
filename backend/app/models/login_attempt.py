from sqlalchemy import Column, DateTime, Integer, String
from app.db.base import Base


class LoginAttempt(Base):
    __tablename__ = "login_attempts"
    key = Column(String(64), primary_key=True)
    failures = Column(Integer, nullable=False, default=0)
    expires_at = Column(DateTime, nullable=False, index=True)
