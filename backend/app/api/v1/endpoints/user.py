from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User
from app.api.dependencies.auth import get_current_user
from app.schemas.v1.user import UserResponse, UserUpdate
from app.models.enums import UserRole
from app.services.user_service import get_weekly_income


router = APIRouter(prefix="/users", tags=["users"])

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
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "filing_status": current_user.filing_status,
        "business_type": current_user.business_type,
        "tax_method": current_user.tax_method,
        "weekly_goal_type": current_user.weekly_goal_type,
        "weekly_goal_amount": current_user.weekly_goal_amount,
        "two_fa_enabled": (
            current_user.two_factor.is_enabled
            if current_user.two_factor
            else False
        ),
        "created_at": current_user.created_at,
    }
@router.get("/me/weekly-goal")
def get_weekly_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.weekly_goal_amount is None or current_user.weekly_goal_amount == 0:
        return {
            "goal": 0,
            "current": 0,
            "remaining": 0,
            "progress": 0,
            "percentage": 0
        }

    goal = current_user.weekly_goal_amount
    current = get_weekly_income(db=db, user_id=current_user.id)
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
    current_user: User = Depends(get_current_user)
):
    update_data = user_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user

@router.delete("/me", response_model=dict)
def delete_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        db.delete(current_user)
        db.commit()

        return {"detail": "User deleted successfully"}

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete user",
        )
