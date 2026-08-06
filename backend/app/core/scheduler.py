import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.services.goal_reminder_service import check_goal_reminder

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def check_all_goal_reminders() -> None:
    print("🔔 Scheduler tick")
    logger.info("Running goal reminder scheduler")

    db: Session = SessionLocal()

    try:
        users = (
            db.query(User)
            .filter(
                User.notifications_enabled.is_(True),
            )
            .all()
        )

        print(f"Found {len(users)} users")
        logger.info("Found %s users to process", len(users))

        for user in users:
            try:
                print(f"Processing user {user.id}")
                logger.info(
                    "Processing goal reminder for user %s",
                    user.id,
                )

                await check_goal_reminder(db, user)

            except Exception:
                logger.exception(
                    "Failed to process goal reminder for user %s",
                    user.id,
                )

    finally:
        db.close()


def start_scheduler() -> None:
    if scheduler.running:
        logger.warning("Scheduler already running")
        return

    scheduler.add_job(
        check_all_goal_reminders,
        trigger="cron",
        hour=8, 
        id="goal_reminders",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    scheduler.start()

    print("✅ Goal reminder scheduler started")
    logger.info("Goal reminder scheduler started")