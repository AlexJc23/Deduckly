from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from typing import Optional
import io

from app.db.session import get_db
from app.models import User
from app.services.yearly_report_service import generate_tax_report
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.subscription import require_active_subscription
from app.services.pdf_service import build_tax_report_pdf

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/{year}")
def get_yearly_report(
    year: int,
    month: Optional[int] = Query(None, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return generate_tax_report(
        db=db,
        user=current_user,
        year=year,
        month=month
    )


@router.get("/{year}/download")
def download_yearly_report(
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_subscription)
):
    data = generate_tax_report(
        db=db,
        user=current_user,
        year=year
    )

    buffer = io.BytesIO()

    build_tax_report_pdf(buffer, data)

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=user_{current_user.id}_tax_report_{year}.pdf"
        }
    )