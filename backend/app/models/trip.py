from sqlalchemy import Integer, String, DateTime, ForeignKey, UniqueConstraint, func, Numeric, Enum as SqlEnum
from sqlalchemy.orm import relationship, mapped_column, Mapped
from decimal import Decimal
from app.models.enums import TripPlatform, TripCategory
from app.db.base import Base

class Trip(Base):
    __tablename__ = "trips"

    __table_args__ = (
        UniqueConstraint("user_id", "start_time", "end_time"),
        UniqueConstraint("user_id", "client_id", name="uq_trips_user_client_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    client_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    creation_fingerprint: Mapped[str | None] = mapped_column(String(64), nullable=True)

    start_time: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)

    start_lat: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    start_lng: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    end_lat: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    end_lng: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)

    start_address: Mapped[str | None] = mapped_column(String(100), nullable=True)
    end_address: Mapped[str | None] = mapped_column(String(100), nullable=True)

    distance_miles: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)


    platform: Mapped[TripPlatform | None] = mapped_column(SqlEnum(TripPlatform, name="trip_platform"), nullable=True)
    category: Mapped[TripCategory] = mapped_column(SqlEnum(TripCategory, name="trip_category"), nullable=False)

    deduction_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="trips")
    income = relationship( "Income", back_populates="trip",uselist=False, cascade="all, delete-orphan" )

    @property
    def income_amount(self):
        return self.income.amount if self.income else None

    def __repr__(self):
        return f"<Trip(id={self.id}, user_id={self.user_id}, platform='{self.platform}', category='{self.category}')>"
