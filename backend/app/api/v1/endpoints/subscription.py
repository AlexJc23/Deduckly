from datetime import UTC, datetime

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

    user = (
        db.query(User)
        .filter(User.id == app_user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    purchased_at_ms = event.get("purchased_at_ms")
    expiration_at_ms = event.get("expiration_at_ms")
    event_type = event.get("type")

    if event_type in {
        "INITIAL_PURCHASE",
        "RENEWAL",
        "UNCANCELLATION",
        "PRODUCT_CHANGE",
        "BILLING_ISSUE",
    }:
        status = "active"
    elif event_type == "CANCELLATION":
        status = "canceled"
    elif event_type == "EXPIRATION":
        status = "expired"
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported RevenueCat event type: {event_type}"
        )

    subscription_data = {
        "status": status,
        "product_id": event.get("product_id"),
        "original_transaction_id": event.get(
            "original_transaction_id"
        ),
        "latest_transaction_id": event.get(
            "transaction_id"
        ),
        "environment": event.get("environment"),
        "purchase_date": (
            datetime.fromtimestamp(
                purchased_at_ms / 1000,
                tz=UTC
            )
            if purchased_at_ms
            else datetime.now(UTC)
        ),
        "expiration_date": datetime.fromtimestamp(
            expiration_at_ms / 1000,
            tz=UTC
        ),
        "auto_renew": event_type != "CANCELLATION",
        "apple_response": event,
    }

    subscription = process_subscription(
        db,
        user.id,
        subscription_data
    )

    return {
        "success": True,
        "subscription": subscription,
    }


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

    subscription = process_subscription(
        db,
        current_user.id,
        payload
    )

    return {
        "success": True,
        "subscription": subscription,
    }