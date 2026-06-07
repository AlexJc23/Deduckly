from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User
from app.schemas.v1.subscription import (
    SubscriptionCreate,
    SubscriptionResponse,
)
from app.services.subscription_service import (
    get_user_subscription,
    has_active_subscription,
    process_subscription,
)
from app.api.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/subscriptions",
    tags=["subscriptions"]
)


@router.get("/me")
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sub = get_user_subscription(db, current_user.id)

    if not sub:
        return {
            "has_active_subscription": False,
            "subscription": None,
        }

    return {
        "has_active_subscription": has_active_subscription(
            db,
            current_user.id
        ),
        "subscription": sub,
    }


@router.post("/webhooks/revenuecat")
def revenuecat_webhook(
    payload: dict,
    db: Session = Depends(get_db)
):
    event = payload.get("event")

    if not event:
        raise HTTPException(
            status_code=400,
            detail="Missing event"
        )

    app_user_id = event.get("app_user_id")

    if not app_user_id:
        raise HTTPException(
            status_code=400,
            detail="Missing app_user_id"
        )

    # find user
    # update subscription

    return {"success": True}

@router.post(
    "/restore",
    response_model=SubscriptionResponse
)
def restore_subscription(
    subscription_data: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return process_subscription(
        db,
        current_user.id,
        subscription_data.model_dump()
    )

@router.post("/sync")
def sync_subscription(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # update local subscription state

    return {"success": True}
