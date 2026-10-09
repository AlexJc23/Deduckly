from typing import Literal
from uuid import UUID
from fastapi import APIRouter, Depends, Query
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
