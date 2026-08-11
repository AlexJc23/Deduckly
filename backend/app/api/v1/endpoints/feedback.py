from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.api.dependencies.auth import (
    get_current_user,
)

from app.db.session import get_db

from app.models.user import User

from app.schemas.v1.feedback import (
    FeedbackCreate,
    FeedbackResponse,
)

from app.services.feedback_service import (
    send_feedback,
)

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"],
)


@router.post(
    "",
    response_model=FeedbackResponse,
)
async def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    await send_feedback(
        user=current_user,
        feedback_type=payload.type,
        title=payload.title,
        description=payload.description,
        platform=payload.platform,
        device_name=payload.device_name,
        os_version=payload.os_version,
        app_version=payload.app_version,
        build_number=payload.build_number,
    )

    return FeedbackResponse(
        message="Feedback submitted successfully."
    )