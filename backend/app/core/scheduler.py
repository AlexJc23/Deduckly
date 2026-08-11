import logging
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.services.goal_reminder_service import (
    check_goal_reminder,
)

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(
    timezone=ZoneInfo("America/New_York"),
)


async def check_all_goal_reminders() -> None:
    logger.info("Running goal reminder scheduler")

    db: Session = SessionLocal()

    try:
        users = (
            db.query(User)
            .filter(
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
                if not user.monthly_income_goal:
                    continue

                logger.info(
                    "Processing goal reminder for user %s",
                    user.id,
                )

                await check_goal_reminder(
                    db,
                    user,
                )

            except Exception:
                logger.exception(
                    "Failed to process goal reminder for user %s",
                    user.id,
                )

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
        hour="8,10,18,21",
        minute=0,
        id="goal_reminders",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    scheduler.start()

    logger.info(
        "Goal reminder scheduler started"
    )