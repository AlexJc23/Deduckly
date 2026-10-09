"""Independent vehicle profiles; no financial/tracking records depend on them."""
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Index, CheckConstraint, func, text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class UserVehicle(Base):
    __tablename__ = "user_vehicles"
    __table_args__ = (
        Index("ix_user_vehicles_user_id", "user_id"),
        Index("uq_user_vehicles_default", "user_id", unique=True,
              postgresql_where=text("is_default AND NOT deleted"), sqlite_where=text("is_default AND NOT deleted")),
        CheckConstraint("version >= 1", name="ck_vehicle_version"),
        CheckConstraint("year BETWEEN 1886 AND 2200", name="ck_vehicle_year"),
        CheckConstraint("fuel_type IN ('gasoline','diesel','hybrid','electric','other')", name="ck_vehicle_fuel"),
        *[CheckConstraint(f"{field} IS NULL OR ({field} > 0 AND {field} <= 1000)", name=f"ck_vehicle_{field}")
          for field in ("city_mpg", "highway_mpg", "combined_mpg", "custom_mpg", "kwh_per_100_miles")],
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    make: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    trim: Mapped[str | None] = mapped_column(String(200))
    fuel_type: Mapped[str] = mapped_column(String(20), nullable=False)
    city_mpg: Mapped[float | None] = mapped_column(Float)
    highway_mpg: Mapped[float | None] = mapped_column(Float)
    combined_mpg: Mapped[float | None] = mapped_column(Float)
    custom_mpg: Mapped[float | None] = mapped_column(Float)
    kwh_per_100_miles: Mapped[float | None] = mapped_column(Float)
    epa_id: Mapped[str | None] = mapped_column(String(20))
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    operation_id: Mapped[str] = mapped_column(String(36), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
