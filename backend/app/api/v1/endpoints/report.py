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
from app.models import User, Trip
from app.services.pdf_service import build_tax_report_pdf
from app.services.report_service import generate_tax_report
from app.services.trip_service import get_daily_trip_breakdown
from app.schemas.v1.current_report import CurrentReport

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/mileage-rates")
def official_mileage_rates(current_user: User = Depends(get_current_user)):
    from app.services.business_mileage import RATES
    today = date.today()
    return [dict(id=int(start.strftime('%Y%m%d')),effective_date=start,business_rate=rate) for start,rate in reversed(RATES) if start<=today]


@router.get("/vehicle-summary")
def vehicle_summary(year: int | None = Query(None,ge=2010,le=2200), month: int | None = Query(None,ge=1,le=12), day: int | None = Query(None,ge=1,le=31),start_date: date | None = None,end_date: date | None = None,vehicle_id: str | None = None,method: str | None = None,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    from app.services.vehicle_reporting import report
    from app.services.subscription_service import has_active_subscription
    advanced=has_active_subscription(db,current_user.id)
    if (start_date or end_date or vehicle_id) and not advanced: raise HTTPException(403,"Premium subscription required for custom and per-vehicle reports")
    return report(db,current_user,year,month,day,start_date,end_date,vehicle_id,method,advanced)

@router.get("/vehicle-exports/{format}")
def vehicle_export(format: str,year: int | None = None,month: int | None = None,day: int | None = None,start_date: date | None = None,end_date: date | None = None,vehicle_id: str | None = None,method: str | None = None,expected_fingerprint: str | None = None,db: Session = Depends(get_db),current_user: User = Depends(require_active_subscription)):
    from app.services.vehicle_reporting import report,export_rows
    import csv
    calculated=report(db,current_user,year,month,day,start_date,end_date,vehicle_id,method,True)
    if expected_fingerprint and expected_fingerprint!=calculated["report_fingerprint"]:raise HTTPException(409,"Report changed; refresh before exporting")
    rows=export_rows(calculated)
    if format=='csv':
        buffer=io.StringIO()
        # Protect spreadsheet formula execution in vehicle names/user-controlled text.
        csv.writer(buffer).writerows([["'"+str(v) if str(v).startswith(('=','+','-','@')) else str(v) for v in row] for row in rows])
        payload=buffer.getvalue().encode('utf-8-sig');kind='text/csv'
    elif format=='pdf':
        from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from xml.sax.saxutils import escape
        buffer=io.BytesIO();styles=getSampleStyleSheet()
        story=[]
        for row in rows:story.extend([Paragraph(escape(' | '.join(str(v) for v in row)),styles['BodyText']),Spacer(1,8)])
        SimpleDocTemplate(buffer).build(story);payload=buffer.getvalue();kind='application/pdf'
    else:raise HTTPException(422,'Choose pdf or csv')
    return StreamingResponse(io.BytesIO(payload),media_type=kind,headers={'Content-Disposition':f'attachment; filename="Deduckly_Report.{format}"'})

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
    # Saved Trips only, including Personal. ShiftSegments never participate.
    report["saved_trip_count"] = db.query(Trip).filter(
        Trip.user_id == current_user.id,
        Trip.start_time >= start_of_day,
        Trip.start_time < start_of_next_day,
    ).count()

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