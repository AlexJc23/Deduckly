from sqlalchemy import Integer, Numeric, DateTime, CheckConstraint, func, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

from decimal import Decimal
from typing import Optional
from datetime import datetime

class MileageRate(Base):
    __tablename__ = "mileage_rates"

    __table_args__ = (
        CheckConstraint("rate >= 0", name="ck_rate_non_negative"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    year: Mapped[int] = mapped_column(index=True, nullable=False)

    rate: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<MileageRate(id={self.id}, year={self.year}, rate={self.rate})>"
