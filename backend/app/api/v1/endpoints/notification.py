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

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)

@router.post("/push-token")
async def save_push_token(
    payload: PushTokenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.expo_push_token:
        raise HTTPException(
            status_code=400,
            detail="Expo push token is required.",
        )

    current_user.expo_push_token = payload.expo_push_token

    db.commit()

    db.refresh(current_user)

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

    return {
        "message": "Push notification sent successfully.",
        "response": response,
    }