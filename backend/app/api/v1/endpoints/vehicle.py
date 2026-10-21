from typing import Literal
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.subscription import require_active_subscription
from app.db.session import get_db
from app.models.vehicle import UserVehicle
from app.schemas.v1.vehicle import VehicleWrite, VehicleResponse, VehicleData
from app.services.vehicle_service import save_vehicle
from app.services import vehicle_lookup, fuel_price_service
router = APIRouter(prefix='/vehicles', tags=['vehicles'])

@router.get('/', response_model=list[VehicleResponse])
def list_vehicles(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(UserVehicle).filter_by(user_id=user.id).all()

@router.get('/catalog/{kind}')
def catalog(kind: Literal['year','make','model','options'], year: int | None = Query(None, ge=1886, le=2200),
            make: str | None = Query(None, max_length=100), model: str | None = Query(None, max_length=100), user=Depends(get_current_user)):
    return vehicle_lookup.menu(kind, year, make, model)

@router.get('/catalog-details/{identity}', response_model=VehicleData)
def catalog_details(identity: int, user=Depends(get_current_user)):
    return vehicle_lookup.vehicle(identity)

@router.get('/fuel-price')
def fuel_price(postal_code: str = Query(pattern=r'^\d{5}$'),
               fuel_type: Literal['gasoline','diesel','hybrid','electric'] = 'gasoline', user=Depends(require_active_subscription)):
    return fuel_price_service.local_price(postal_code, fuel_type)

@router.put('/{identity}', response_model=VehicleResponse)
def save(identity: UUID, data: VehicleWrite, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return save_vehicle(db, user.id, str(identity), data)


from decimal import Decimal
from pydantic import BaseModel, Field, model_validator
class TaxSettings(BaseModel):
    method: Literal['standard_mileage','actual_expenses']='standard_mileage'
    total_miles: Decimal | None = Field(None,gt=0,max_digits=12,decimal_places=2)
    business_miles: Decimal | None = Field(None,ge=0,max_digits=12,decimal_places=2)
    ownership: Literal['owned','leased'] | None = None
    first_business_year: int | None = Field(None,ge=1900,le=2200)
    first_method: Literal['standard_mileage','actual_expenses'] | None = None
    prior_method: Literal['standard_mileage','actual_expenses'] | None = None
    section179: bool | None = None
    bonus_depreciation: bool | None = None
    accelerated_depreciation: bool | None = None
    fleet: bool | None = None
    @model_validator(mode='after')
    def mileage(self):
        if self.business_miles is not None and (self.total_miles is None or self.business_miles>self.total_miles):raise ValueError('Business mileage requires total mileage at least as large')
        return self

@router.get('/{identity}/tax-settings/{year}')
def get_tax_settings(identity: UUID,year: int,db: Session=Depends(get_db),user=Depends(get_current_user)):
    from app.models.vehicle_tax import VehicleTaxSetting
    from app.services.vehicle_reporting import owned_vehicle
    owned_vehicle(db,user.id,str(identity),True)
    row=db.query(VehicleTaxSetting).filter_by(user_id=user.id,vehicle_id=str(identity),year=year).one_or_none()
    return {key:getattr(row,key,None) for key in TaxSettings.model_fields} if row else None

@router.put('/{identity}/tax-settings/{year}')
def put_tax_settings(identity: UUID,year: int,data: TaxSettings,db: Session=Depends(get_db),user=Depends(get_current_user)):
    from app.models.vehicle_tax import VehicleTaxSetting
    from app.models import User
    from app.services.vehicle_reporting import owned_vehicle
    if not 2010<=year<=2200:raise HTTPException(422,'Invalid tax year')
    try:
        if db.query(User.id).filter(User.id==user.id,User.is_active.is_(True)).with_for_update().one_or_none() is None:
            raise HTTPException(401,'Account unavailable')
        owned_vehicle(db,user.id,str(identity),True)
        row=db.query(VehicleTaxSetting).filter_by(user_id=user.id,vehicle_id=str(identity),year=year).one_or_none()
        if row is None:row=VehicleTaxSetting(user_id=user.id,vehicle_id=str(identity),year=year)
        for k,v in data.model_dump().items():setattr(row,k,v)
        db.add(row);db.commit()
        return data
    except Exception:db.rollback();raise
