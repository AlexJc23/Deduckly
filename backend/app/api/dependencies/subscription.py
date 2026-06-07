from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.dependencies.auth import get_current_user
from app.services.subscription_service import (
    has_active_subscription
)


def require_active_subscription(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not has_active_subscription(
        db,
        current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Premium subscription required"
        )

    return current_user
