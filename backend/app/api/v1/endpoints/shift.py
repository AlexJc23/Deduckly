from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models import Shift, User
from app.schemas.v1.shift import ShiftSnapshot
from app.services.shift_service import get_shift, snapshot, sync_shift

router = APIRouter(prefix='/shifts', tags=['shifts'])

@router.get('/', response_model=list[ShiftSnapshot])
def history(limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return [snapshot(row) for row in db.query(Shift).filter_by(user_id=user.id).order_by(Shift.started_at.desc(), Shift.id.desc()).offset(offset).limit(limit).all()]

@router.get('/active', response_model=ShiftSnapshot | None)
def active(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    row = db.query(Shift).filter_by(user_id=user.id, ended_at=None).first()
    return snapshot(row) if row else None

@router.get('/{client_id}', response_model=ShiftSnapshot)
def detail(client_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return snapshot(get_shift(db, user.id, client_id))

@router.put('/{client_id}', response_model=ShiftSnapshot)
def synchronize(client_id: str, data: ShiftSnapshot, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if data.client_id != client_id:
        raise HTTPException(422, 'Shift identity mismatch')
    return sync_shift(db, user.id, data)
