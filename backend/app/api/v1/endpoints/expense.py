from typing import Optional
from decimal import Decimal
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Expense, User
from app.models.enums import ExpenseCategory
from app.schemas.v1.expense import ExpenseCreate, ExpenseResponse
from app.services.expense_service import (
    create_expense,
    get_expense,
    get_expenses_for_user,
)
from app.services.storage_service import (
    upload_file_to_s3,
    delete_file_from_s3,
)
from app.api.dependencies.auth import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=ExpenseResponse)
async def create_expense_endpoint(
    amount: Decimal,
    category: ExpenseCategory,
    merchant: Optional[str] = None,
    description: Optional[str] = None,
    business_percentage: Decimal = Decimal("100.00"),
    file: Optional[UploadFile] = File(None),
    incurred_at: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    receipt_url = None

    if file:
        receipt_url = upload_file_to_s3(file, current_user.id)

    expense_in = ExpenseCreate(
        amount=amount,
        category=category,
        merchant=merchant,
        description=description,
        business_percentage=business_percentage,
        incurred_at=incurred_at or datetime.now(timezone.utc),
        receipt_url=receipt_url,
    )

    return create_expense(db, expense_in, current_user.id)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense_endpoint(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_expense(db, expense_id, current_user.id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    return expense


@router.get("/", response_model=list[ExpenseResponse])
def get_expenses_endpoint(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_expenses_for_user(
        db,
        current_user.id,
        start_date,
        end_date,
    )


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense_endpoint(
    expense_id: int,
    amount: Optional[Decimal] = None,
    category: Optional[ExpenseCategory] = None,
    merchant: Optional[str] = None,
    description: Optional[str] = None,
    business_percentage: Optional[Decimal] = None,
    file: Optional[UploadFile] = File(None),
    incurred_at: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_expense(db, expense_id, current_user.id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if file:
        if expense.receipt_url:
            delete_file_from_s3(expense.receipt_url)

        expense.receipt_url = upload_file_to_s3(file, current_user.id)

    if amount is not None:
        expense.amount = amount

    if category is not None:
        expense.category = category

    if merchant is not None:
        expense.merchant = merchant

    if description is not None:
        expense.description = description

    if business_percentage is not None:
        expense.business_percentage = business_percentage

    if incurred_at is not None:
        expense.incurred_at = incurred_at

    db.commit()
    db.refresh(expense)

    return expense


@router.delete("/{expense_id}")
def delete_expense_endpoint(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_expense(db, expense_id, current_user.id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if expense.receipt_url:
        delete_file_from_s3(expense.receipt_url)

    db.delete(expense)
    db.commit()

    return {"detail": "Expense deleted successfully"}