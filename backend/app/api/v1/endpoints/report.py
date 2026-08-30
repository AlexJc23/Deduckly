from datetime import date, datetime
from typing import Optional
import io
import json

from app.services.csv_service import build_tax_report_csv
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from zoneinfo import ZoneInfo

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.subscription import require_active_subscription
from app.db.session import get_db
from app.models import User
from app.services.pdf_service import build_tax_report_pdf
from app.services.report_service import generate_tax_report
from app.services.trip_service import get_daily_trip_breakdown
from app.schemas.v1.current_report import CurrentReport

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/today")
def get_today_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        tz = ZoneInfo(current_user.timezone)
    except (AttributeError, ValueError):
        tz = ZoneInfo("America/New_York")

    today = datetime.now(tz)

    start_of_day = today.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    start_of_next_day = start_of_day.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    from datetime import timedelta

    start_of_next_day += timedelta(days=1)

    report = generate_tax_report(
        db=db,
        user=current_user,
        year=today.year,
        month=today.month,
        day=today.day,
    )

    trip_breakdown = get_daily_trip_breakdown(
        db=db,
        user_id=current_user.id,
        start_of_day=start_of_day,
        start_of_next_day=start_of_next_day,
    )

    report["trip_breakdown"] = trip_breakdown

    return report


# -------------------------
# NEW UNIVERSAL REPORT ENDPOINT
# -------------------------
@router.get("")
def get_report(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None, ge=1, le=12),
    day: Optional[int] = Query(None, ge=1, le=31),

    # For future custom ranges
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return generate_tax_report(
        db=db,
        user=current_user,
        year=year,
        month=month,
        day=day,
        start_date=start_date,
        end_date=end_date,
    )


@router.post("/exports/pdf")
def export_pdf(
    report: CurrentReport,
    current_user: User = Depends(require_active_subscription),
):
    buffer = io.BytesIO()

    build_tax_report_pdf(
        buffer,
        report.model_dump(mode="json"),
    )

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="Deduckly_Report_{report.year}.pdf"'
        },
    )


@router.post("/exports/csv")
def export_csv(
    report: CurrentReport,
    current_user: User = Depends(require_active_subscription),
):
    buffer = io.StringIO()

    build_tax_report_csv(
        buffer,
        report.model_dump(mode="json"),
    )

    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                f'attachment; filename="Deduckly_Report_{report.year}.csv"'
        },
    )