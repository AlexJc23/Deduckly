from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from typing import List, Optional
from decimal import Decimal, InvalidOperation

from app.models import TaxBracket, User
from app.schemas.v1.bracket import TaxBracketCreate, TaxBracketUpdate
from app.models.enums import FilingStatus, UserRole


def get_tax_brackets(db: Session, year: int, filing_status: FilingStatus) -> List[TaxBracket]:
    try:
        return (
            db.query(TaxBracket)
            .filter(
                TaxBracket.year == year,
                TaxBracket.filing_status == filing_status
            )
            .order_by(TaxBracket.min_income.asc())
            .all()
        )
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to fetch tax brackets")


def _validate_range(min_income: Decimal, max_income: Optional[Decimal]):
    if min_income < 0:
        raise HTTPException(status_code=400, detail="min_income cannot be negative")

    if max_income is not None and max_income <= min_income:
        raise HTTPException(
            status_code=400,
            detail="max_income must be greater than min_income"
        )


def _check_overlap(
    existing: List[TaxBracket],
    new_min: Decimal,
    new_max: Optional[Decimal],
    exclude_id: Optional[int] = None
):
    upper_a = new_max if new_max is not None else Decimal("Infinity")

    for bracket in existing:
        if exclude_id and bracket.id == exclude_id:
            continue

        b_min = bracket.min_income
        upper_b = bracket.max_income if bracket.max_income is not None else Decimal("Infinity")

        if not (upper_a <= b_min or new_min >= upper_b):
            raise HTTPException(
                status_code=400,
                detail=f"Tax bracket overlaps with existing bracket (id={bracket.id})"
            )


def _check_top_bracket(
    existing: List[TaxBracket],
    new_max: Optional[Decimal],
    exclude_id: Optional[int] = None
):
    if new_max is not None:
        return

    for bracket in existing:
        if exclude_id and bracket.id == exclude_id:
            continue

        if bracket.max_income is None:
            raise HTTPException(
                status_code=400,
                detail="Only one top bracket (max_income=None) allowed"
            )


def create_tax_bracket(db: Session,  bracket_in: TaxBracketCreate, user: User ) -> TaxBracket:
    try:
        if user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Only admins can create tax brackets")

        _validate_range(bracket_in.min_income, bracket_in.max_income)

        existing = get_tax_brackets(db, bracket_in.year, bracket_in.filing_status)

        _check_top_bracket(existing, bracket_in.max_income)
        _check_overlap(existing, bracket_in.min_income, bracket_in.max_income)

        db_bracket = TaxBracket(**bracket_in.model_dump())

        db.add(db_bracket)
        db.commit()
        db.refresh(db_bracket)

        return db_bracket

    except HTTPException:
        raise

    except (SQLAlchemyError, InvalidOperation):
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create tax bracket")


def update_tax_bracket(
    db: Session,
    bracket_id: int,
    bracket_in: TaxBracketUpdate, user: User
) -> TaxBracket:

    try:
        if user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Only admins can update tax brackets")

        bracket = db.query(TaxBracket).filter(TaxBracket.id == bracket_id).first()

        if not bracket:
            raise HTTPException(status_code=404, detail="Tax bracket not found")

        updated_data = bracket_in.model_dump(exclude_unset=True)

        year = updated_data.get("year", bracket.year)
        filing_status = updated_data.get("filing_status", bracket.filing_status)

        min_income = updated_data.get("min_income", bracket.min_income)
        max_income = updated_data.get("max_income", bracket.max_income)

        _validate_range(min_income, max_income)

        existing = get_tax_brackets(db, year, filing_status)

        _check_top_bracket(existing, max_income, exclude_id=bracket.id)
        _check_overlap(existing, min_income, max_income, exclude_id=bracket.id)

        for field, value in updated_data.items():
            setattr(bracket, field, value)

        db.commit()
        db.refresh(bracket)

        return bracket

    except HTTPException:
        raise

    except (SQLAlchemyError, InvalidOperation):
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update tax bracket")


def delete_tax_bracket(db: Session, bracket_id: int, user: User):
    try:
        if user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Only admins can delete tax brackets")

        bracket = db.query(TaxBracket).filter(TaxBracket.id == bracket_id).first()

        if not bracket:
            raise HTTPException(status_code=404, detail="Tax bracket not found")

        db.delete(bracket)
        db.commit()

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete tax bracket")
