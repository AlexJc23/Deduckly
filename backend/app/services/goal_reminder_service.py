import logging
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from sqlalchemy.exc import IntegrityError
from app.models.notification_occurrence import NotificationOccurrence
from app.services.notification_message_service import build_daily_goal_message, build_monthly_kickoff_message
from app.services.notification_service import send_push_notification, get_push_receipts
from app.models.user import User

logger = logging.getLogger(__name__)


def due_reminders(user, now):
    """A 15-minute grace window tolerates brief downtime without stale catch-up pushes."""
    if not user.notifications_enabled or not user.goal_reminders_enabled or not user.expo_push_token:
        return []
    try:
        local = now.astimezone(ZoneInfo(user.timezone))
    except (ZoneInfoNotFoundError, ValueError, TypeError):
        return []  # Do not guess a local delivery time.
    if local.minute >= 15 or local.hour not in (8, 12, 16):
        return []
    messages = []
    if local.day == 1 and local.hour == 8:
        messages.append(("monthly_kickoff", local.strftime("%Y-%m"),
                         build_monthly_kickoff_message(local.strftime("%B"), user.monthly_income_goal)))
    messages.append((f"daily_{local.hour}", local.date().isoformat(),
                     build_daily_goal_message(local.hour, user.daily_income_goal)))
    return messages


async def check_goal_reminder(db, user, now=None):
    now = now or datetime.now(timezone.utc)
    for kind, period, (title, body) in due_reminders(user, now):
        occurrence = NotificationOccurrence(user_id=user.id, kind=kind, period=period,
                                            claimed_at=now, status="claimed")
        try:
            # Commit before contacting Expo: unique across processes and restarts.
            with db.begin_nested():
                db.add(occurrence)
                db.flush()
            db.commit()
        except IntegrityError:
            continue
        # Recheck preferences after claiming in case they changed during the scan.
        db.refresh(user, attribute_names=["notifications_enabled", "goal_reminders_enabled", "expo_push_token"])
        if not user.notifications_enabled or not user.goal_reminders_enabled or not user.expo_push_token:
            occurrence.status = "skipped"
            db.commit()
            continue
        occurrence.push_token = user.expo_push_token
        db.commit()
        try:
            result = await send_push_notification(occurrence.push_token, title, body)
            ticket = result.get("data", {})
            if ticket.get("status") == "ok":
                occurrence.status = "accepted"
                occurrence.ticket_id = ticket.get("id")
            else:
                occurrence.status = "rejected"
                if ticket.get("details", {}).get("error") == "DeviceNotRegistered":
                    db.query(User).filter(User.id == user.id, User.expo_push_token == occurrence.push_token).update(
                        {User.expo_push_token: None}, synchronize_session="fetch")
                logger.warning("Expo rejected notification occurrence %s", occurrence.id)
        except Exception:
            # A timeout may occur AFTER Expo accepts a push. Never blindly resend.
            occurrence.status = "uncertain"
            logger.exception("Notification occurrence %s has uncertain delivery", occurrence.id)
        db.commit()


async def check_notification_receipts(db, now=None):
    """Receipts confirm provider handoff, not that a person saw the notification."""
    now = now or datetime.now(timezone.utc)
    db.query(NotificationOccurrence).filter(
        NotificationOccurrence.status == "accepted",
        NotificationOccurrence.claimed_at < now - timedelta(hours=24),
    ).update({NotificationOccurrence.status: "unconfirmed"}, synchronize_session=False)
    db.commit()
    pending = db.query(NotificationOccurrence).filter(
        NotificationOccurrence.status == "accepted",
        NotificationOccurrence.ticket_id.isnot(None),
        NotificationOccurrence.claimed_at <= now - timedelta(minutes=15),
    ).order_by(NotificationOccurrence.claimed_at).limit(1000).all()
    if not pending:
        return
    receipts = await get_push_receipts([item.ticket_id for item in pending])
    for item in pending:
        receipt = receipts.get(item.ticket_id)
        if not receipt:
            continue
        item.status = "handed_off" if receipt.get("status") == "ok" else "rejected"
        if receipt.get("details", {}).get("error") == "DeviceNotRegistered":
            # A receipt for an old token must not remove a newer registration.
            db.query(User).filter(User.id == item.user_id, User.expo_push_token == item.push_token).update(
                {User.expo_push_token: None}, synchronize_session=False)
    db.commit()
