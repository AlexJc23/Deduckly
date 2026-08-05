from app.mappers.user_mapper import to_user_response
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User
from app.models.enums import UserRole
from app.api.dependencies.auth import get_current_user
from app.schemas.v1.user import UserResponse, UserUpdate
from app.services.subscription_service import is_user_premium
from app.services.user_service import (
    get_weekly_income,
    get_monthly_income,
    update_user,
)

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource.",
        )

    return db.query(User).all()


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return to_user_response(current_user)



@router.get("/me/weekly-goal")
def get_weekly_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if (
        current_user.weekly_income_goal is None
        or current_user.weekly_income_goal == 0
    ):
        return {
            "goal": 0,
            "current": 0,
            "remaining": 0,
            "progress": 0,
            "percentage": 0,
        }

    goal = current_user.weekly_income_goal

    current = get_weekly_income(
        db=db,
        user_id=current_user.id,
    )

    raw_progress = current / goal

    return {
        "goal": goal,
        "current": current,
        "remaining": max(goal - current, 0),
        "over_goal": max(current - goal, 0),
        "progress": min(raw_progress, 1),
        "percentage": round(raw_progress * 100),
    }

@router.get("/me/monthly-goal")
def get_monthly_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if (
        current_user.monthly_income_goal is None
        or current_user.monthly_income_goal == 0
    ):
        return {
            "goal": 0,
            "current": 0,
            "remaining": 0,
            "over_goal": 0,
            "progress": 0,
            "percentage": 0,
        }

    goal = current_user.monthly_income_goal

    current = get_monthly_income(
        db=db,
        user_id=current_user.id,
    )

    raw_progress = current / goal

    return {
        "goal": goal,
        "current": current,
        "remaining": max(goal - current, 0),
        "over_goal": max(current - goal, 0),
        "progress": min(raw_progress, 1),
        "percentage": round(raw_progress * 100),
    }

@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_user = update_user(
        db=db,
        user_id=current_user.id,
        user_in=user_update,
    )

    return to_user_response(updated_user)


@router.delete("/me", response_model=dict)
def delete_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        db.delete(current_user)
        db.commit()

        return {
            "detail": "User deleted successfully",
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user",
        )