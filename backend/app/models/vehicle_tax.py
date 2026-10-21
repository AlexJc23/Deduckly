from decimal import Decimal
from sqlalchemy import Integer, String, Numeric, Boolean, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
class VehicleTaxSetting(Base):
    __tablename__='vehicle_tax_settings'
    __table_args__=(UniqueConstraint('user_id','vehicle_id','year',name='uq_vehicle_tax_year'),CheckConstraint('total_miles IS NULL OR total_miles > 0',name='ck_vehicle_tax_total'),CheckConstraint('business_miles IS NULL OR (total_miles IS NOT NULL AND business_miles >= 0 AND business_miles <= total_miles)',name='ck_vehicle_tax_business'))
    id: Mapped[int]=mapped_column(Integer,primary_key=True)
    user_id: Mapped[int]=mapped_column(ForeignKey('users.id',ondelete='CASCADE'),nullable=False)
    vehicle_id: Mapped[str]=mapped_column(ForeignKey('user_vehicles.id',ondelete='CASCADE'),nullable=False)
    year: Mapped[int]=mapped_column(Integer,nullable=False)
    method: Mapped[str]=mapped_column(String(30),default='standard_mileage',nullable=False)
    total_miles: Mapped[Decimal|None]=mapped_column(Numeric(12,2))
    business_miles: Mapped[Decimal|None]=mapped_column(Numeric(12,2))
    ownership: Mapped[str|None]=mapped_column(String(10))
    first_business_year: Mapped[int|None]=mapped_column(Integer)
    first_method: Mapped[str|None]=mapped_column(String(30))
    prior_method: Mapped[str|None]=mapped_column(String(30))
    section179: Mapped[bool|None]=mapped_column(Boolean)
    bonus_depreciation: Mapped[bool|None]=mapped_column(Boolean)
    accelerated_depreciation: Mapped[bool|None]=mapped_column(Boolean)
    fleet: Mapped[bool|None]=mapped_column(Boolean)
