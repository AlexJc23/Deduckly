from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User, MileageRate
from app.schemas.v1.mileage_rate import MileageRateCreate, MileageRateResponse, MileageRate
from app.services.mileage_rate_service import create_mileage_rate, get_mileage_rates, update_mileage_rate
from app.api.dependencies.auth import get_current_user


router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/mileage-rate", response_model=MileageRateResponse)
def create_mileage_rate_endpoint(
    rate_in: MileageRateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_mileage_rate(db, rate_in)

@router.get("/mileage-rate", response_model=list[MileageRateResponse])
def get_mileage_rates_endpoint(
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_mileage_rates(db, year)

@router.put("/mileage-rate/{rate_id}", response_model=MileageRateResponse)
def update_mileage_rate_endpoint(
    rate_id: int,
    rate_in: MileageRateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_mileage_rate(db, rate_id, rate_in)

@router.delete("/mileage-rate/{rate_id}")
def delete_mileage_rate_endpoint(
    rate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rate = db.query(MileageRate).filter(MileageRate.id == rate_id).first()

    if not rate:
        raise HTTPException(status_code=404, detail="Mileage rate not found")

    db.delete(rate)
    db.commit()

    return {"detail": "Mileage rate deleted successfully"}
