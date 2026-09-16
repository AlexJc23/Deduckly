from sqlalchemy import Column, String, Text, DateTime, JSON
from app.db.base import Base

class GoogleOAuthTransaction(Base):
    __tablename__ = "google_oauth_transactions"
    state_hash = Column(String(64), primary_key=True)
    app_challenge = Column(String(43), nullable=False)
    google_verifier = Column(Text, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    exchange_hash = Column(String(64), nullable=True, unique=True)
    identity = Column(JSON, nullable=True)
