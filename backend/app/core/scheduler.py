import logging
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session, lazyload

from app.db.session import SessionLocal
from app.models.user import User
from app.services.goal_reminder_service import (
    check_goal_reminder,
    check_notification_receipts,
)

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(
    timezone=ZoneInfo("UTC"),
)


async def check_all_goal_reminders() -> None:
    logger.info("Running goal reminder scheduler")

    db: Session = SessionLocal(expire_on_commit=False)

    try:
        users = (
            db.query(User)
            .options(lazyload("*"))
            .filter(
                User.is_active.is_(True),
                User.expo_push_token.isnot(None),
                User.notifications_enabled.is_(True),
                User.goal_reminders_enabled.is_(True),
            )
            .all()
        )

        logger.info(
            "Found %s users to process",
            len(users),
        )

        for user in users:
            try:

                logger.info(
                    "Processing goal reminder for user %s",
                    user.id,
                )

                await check_goal_reminder(
                    db,
                    user,
                )

            except Exception:
                db.rollback()
                logger.exception(
                    "Failed to process goal reminder for user %s",
                    user.id,
                )

        try:
            await check_notification_receipts(db)
        except Exception:
            db.rollback()
            logger.exception("Failed to check notification receipts")
    finally:
        db.close()


def start_scheduler() -> None:
    if scheduler.running:
        logger.warning(
            "Scheduler already running"
        )
        return

    scheduler.add_job(
        check_all_goal_reminders,
        trigger="cron",
        minute="*",
        second=0,
        misfire_grace_time=60,
        id="goal_reminders",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    scheduler.start()

    logger.info(
        "Goal reminder scheduler started"
    )