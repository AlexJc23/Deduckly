from typing import Optional
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Query,
)
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User
from app.schemas.v1.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
)
from app.services.expense_service import (
    create_expense,
    get_expense,
    get_expenses_for_user,
    update_expense,
    delete_expense,
)
from app.services.storage_service import (
    upload_file_to_s3,
    delete_file_from_s3,
    generate_presigned_url,
)
from app.api.dependencies.auth import (
    get_current_user,
)

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
)


@router.post(
    "/",
    response_model=ExpenseResponse,
)
async def create_expense_endpoint(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = create_expense(
        db=db,
        expense_in=expense_in,
        user_id=current_user.id,
        timezone_name=current_user.timezone,
    )

    expense.receipt_url = generate_presigned_url(
        expense.receipt_url,
    )

    return expense


@router.post(
    "/{expense_id}/receipt",
    response_model=ExpenseResponse,
)
async def upload_expense_receipt(
    expense_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_expense(
        db,
        expense_id,
        current_user.id,
    )

    try:
        if expense.receipt_url:
            delete_file_from_s3(
                expense.receipt_url,
            )

        expense.receipt_url = (
            upload_file_to_s3(
                file,
                current_user.id,
            )
        )

        db.commit()
        db.refresh(expense)

        expense.receipt_url = (
            generate_presigned_url(
                expense.receipt_url,
            )
        )

        return expense

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to upload receipt",
        )


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
def get_expense_endpoint(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_expense(
        db=db,
        expense_id=expense_id,
        user_id=current_user.id,
    )

    expense.receipt_url = (
        generate_presigned_url(
            expense.receipt_url,
        )
    )

    return expense


@router.get(
    "/",
    response_model=list[ExpenseResponse],
)
def get_expenses_endpoint(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    sort: str = Query(
        "desc",
        pattern="^(asc|desc)$",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expenses = get_expenses_for_user(
        db=db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        sort=sort,
    )

    for expense in expenses:
        expense.receipt_url = (
            generate_presigned_url(
                expense.receipt_url,
            )
        )

    return expenses


@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
async def update_expense_endpoint(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = update_expense(
        db=db,
        expense_id=expense_id,
        expense_in=expense_in,
        user_id=current_user.id,
        timezone_name=current_user.timezone,
    )

    expense.receipt_url = (
        generate_presigned_url(
            expense.receipt_url,
        )
    )

    return expense


@router.delete("/{expense_id}")
def delete_expense_endpoint(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_expense(
        db=db,
        expense_id=expense_id,
        user_id=current_user.id,
    )

    if expense.receipt_url:
        try:
            delete_file_from_s3(
                expense.receipt_url,
            )
        except Exception:
            pass

    delete_expense(
        db=db,
        expense_id=expense_id,
        user_id=current_user.id,
    )

    return {
        "detail": "Expense deleted successfully",
    }


@router.delete(
    "/{expense_id}/receipt",
    response_model=ExpenseResponse,
)
def delete_expense_receipt(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_expense(
        db=db,
        expense_id=expense_id,
        user_id=current_user.id,
    )

    if not expense.receipt_url:
        raise HTTPException(
            status_code=404,
            detail="Expense does not have a receipt.",
        )

    try:
        delete_file_from_s3(
            expense.receipt_url,
        )

        expense.receipt_url = None

        db.commit()
        db.refresh(expense)

        return expense

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete receipt",
        )