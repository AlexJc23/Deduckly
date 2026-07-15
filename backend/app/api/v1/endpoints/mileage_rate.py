from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User, MileageRate
from app.schemas.v1.mileage_rate import MileageRateCreate, MileageRateResponse, MileageRateUpdate
from app.services.mileage_rate_service import create_mileage_rate, get_mileage_rates, update_mileage_rate, delete_mileage_rate
from app.api.dependencies.auth import get_current_user


router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/mileage-rate", response_model=MileageRateResponse)
def create_mileage_rate_endpoint(
    business_rate: MileageRateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_mileage_rate(db, business_rate, current_user)

@router.get("/mileage-rate", response_model=list[MileageRateResponse])
def get_mileage_rates_endpoint(
    effective_date: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_mileage_rates(db, effective_date, current_user)

@router.put("/{business_rate_id}")
def update_mileage_rate_endpoint(
    business_rate_id: int,
    business_rate: MileageRateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_mileage_rate(db, business_rate_id, business_rate, current_user)

@router.delete("/mileage-rate/{business_rate_id}")
def delete_mileage_rate_endpoint(
    business_rate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delete_mileage_rate(
        db,
        business_rate_id,
        current_user
    )

    return {
        "detail": "Mileage rate deleted successfully"
    }
