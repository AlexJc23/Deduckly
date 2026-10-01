import asyncio
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.api.dependencies.auth import get_current_user

from app.models.user import User

from app.schemas.v1.notification import PushTokenUpdate

from app.services.notification_service import (
    send_push_notification as send_expo_push_notification,
)
from fastapi import HTTPException

from app.services.push_registration_service import register_push_token, lock_push_token

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)

@router.post("/push-token")
def save_push_token(
    payload: PushTokenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    register_push_token(db, current_user.id, payload.expo_push_token, payload.timezone)

    return {
        "message": "Push token saved successfully."
    }

@router.post("/send-push-notification")
async def send_test_push_notification(
    title: str,
    body: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expected_token = current_user.expo_push_token
    if db.get_bind().dialect.name == "postgresql":
        await asyncio.to_thread(lock_push_token, db, expected_token)
    db.refresh(current_user, attribute_names=["expo_push_token", "notifications_enabled", "is_active"])
    if not current_user.is_active or current_user.expo_push_token != expected_token:
        raise HTTPException(status_code=409, detail="Notification registration changed.")
    if not current_user.notifications_enabled:
        raise HTTPException(status_code=403, detail="Notifications are disabled.")
    if not current_user.expo_push_token:
        raise HTTPException(
            status_code=400,
            detail="No push token found for the user."
        )
    

    response = await send_expo_push_notification(
        token=current_user.expo_push_token,
        title=title,
        body=body,
    )

    db.commit()
    return {
        "message": "Push notification sent successfully.",
        "response": response,
    }

