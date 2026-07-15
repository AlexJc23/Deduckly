from sqlite3 import Date

from sqlalchemy import Integer, Numeric, DateTime, CheckConstraint, UniqueConstraint, func, Date
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

from decimal import Decimal
from datetime import date, datetime



class MileageRate(Base):
    __tablename__ = "mileage_rates"

    __table_args__ = (
    CheckConstraint("business_rate >= 0", name="ck_rate_non_negative"),
    UniqueConstraint("effective_date", name="uq_mileage_rate_effective_date"),
)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    effective_date: Mapped[date] = mapped_column(
        Date,
        index=True,
        nullable=False
    )

    business_rate: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<MileageRate(id={self.id}, effective_date={self.effective_date}, business_rate={self.business_rate})>"
