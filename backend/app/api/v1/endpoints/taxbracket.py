from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import TaxBracket, User
from app.schemas.v1.bracket import TaxBracketCreate, TaxBracketResponse
from app.services.bracket_service import create_tax_bracket, get_tax_brackets, update_tax_bracket, delete_tax_bracket
from app.api.dependencies.auth import get_current_user



router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/tax-bracket", response_model=TaxBracketResponse)
def create_tax_bracket_endpoint(
    bracket_in: TaxBracketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_tax_bracket(db, bracket_in, current_user)


@router.put("/tax-bracket/{bracket_id}", response_model=TaxBracketResponse)
def update_tax_bracket_endpoint(
    bracket_id: int,
    bracket_in: TaxBracketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_tax_bracket(db, bracket_id, bracket_in, current_user)

@router.delete("/tax-bracket/{bracket_id}")
def delete_tax_bracket_endpoint(
    bracket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delete_tax_bracket(db, bracket_id, current_user)
    return {"detail": "Tax bracket deleted successfully"}

