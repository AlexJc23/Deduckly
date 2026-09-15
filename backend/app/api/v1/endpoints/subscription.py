import secrets
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models import User
from app.services.subscription_service import (
    get_user_subscription,
    has_active_subscription,
    process_subscription,
)

router = APIRouter(
    prefix="/subscriptions",
    tags=["subscriptions"],
)


@router.get("/me")
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
            current_user.id,
        ),
        "subscription": sub,
    }


@router.post("/webhooks/revenuecat")
def revenuecat_webhook(
    payload: dict,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    expected_secret = settings.revenuecat_webhook_secret

    if not expected_secret:
        raise HTTPException(
            status_code=500,
            detail="RevenueCat webhook authentication is not configured",
        )

    expected_authorization = f"Bearer {expected_secret}"

    if not secrets.compare_digest(
        authorization or "",
        expected_authorization,
    ):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized",
        )

    event = payload.get("event")

    if not event:
        raise HTTPException(
            status_code=400,
            detail="Missing event",
        )

    event_type = event.get("type")
    app_user_id = event.get("app_user_id")

    if event_type == "TEST":
        return {
            "success": True,
            "message": "RevenueCat test webhook received",
        }

    if event_type == "TRANSFER":
        return {
            "success": True,
            "message": "RevenueCat transfer webhook received",
        }

    if not app_user_id:
        raise HTTPException(
            status_code=400,
            detail="Missing app_user_id",
        )

    try:
        user_id = int(app_user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid RevenueCat app_user_id",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    purchased_at_ms = event.get("purchased_at_ms")
    expiration_at_ms = event.get("expiration_at_ms")

    if not expiration_at_ms:
        raise HTTPException(
            status_code=400,
            detail=f"Missing expiration_at_ms for {event_type}",
        )

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
        return {
            "success": True,
            "message": f"Ignored RevenueCat event type: {event_type}",
        }

    product_id = (
        event.get("new_product_id")
        if event_type == "PRODUCT_CHANGE"
        else event.get("product_id")
    )

    if not product_id:
        raise HTTPException(
            status_code=400,
            detail=f"Missing product_id for {event_type}",
        )

    original_transaction_id = event.get(
        "original_transaction_id"
    )

    transaction_id = event.get("transaction_id")

    if not original_transaction_id:
        raise HTTPException(
            status_code=400,
            detail=f"Missing original_transaction_id for {event_type}",
        )

    if not transaction_id:
        raise HTTPException(
            status_code=400,
            detail=f"Missing transaction_id for {event_type}",
        )

    subscription_data = {
        "status": status,
        "product_id": product_id,
        "original_transaction_id": original_transaction_id,
        "latest_transaction_id": transaction_id,
        "environment": event.get("environment"),
        "purchase_date": (
            datetime.fromtimestamp(
                purchased_at_ms / 1000,
                tz=UTC,
            )
            if purchased_at_ms
            else datetime.now(UTC)
        ),
        "expiration_date": datetime.fromtimestamp(
            expiration_at_ms / 1000,
            tz=UTC,
        ),
        "auto_renew": event_type != "CANCELLATION",
        "provider_response": event,
    }

    process_subscription(
        db,
        user.id,
        subscription_data,
    )

    return {
        "success": True,
    }


@router.post("/restore")
def restore_subscription(
    current_user: User = Depends(get_current_user),
):
    raise HTTPException(
        status_code=410,
        detail="Client-driven subscription restore is no longer supported",
    )


@router.post("/sync")
def sync_subscription(
    current_user: User = Depends(get_current_user),
):
    raise HTTPException(
        status_code=410,
        detail="Client-driven subscription sync is no longer supported",
    )
