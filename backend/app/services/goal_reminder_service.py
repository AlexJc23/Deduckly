from calendar import monthrange
from datetime import datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.user import User
from app.services.goal_pacing_service import (
    get_expected_monthly_income,
)
from app.services.notification_message_service import (
    build_end_of_month_message,
    build_goal_reached_message,
    build_goal_reminder_message,
)
from app.services.notification_service import (
    send_push_notification,
)
from app.services.report_service import (
    get_current_month_income,
)


async def check_goal_reminder(
    db: Session,
    user: User,
) -> None:
    today = datetime.now()
    today_date = today.date()

    if not user.notifications_enabled:
        return

    # if not user.goal_reminders_enabled:
    #     return

    if not user.expo_push_token:
        return

    if not user.monthly_income_goal:
        return

    if (
        user.last_goal_notification_sent_at
        and user.last_goal_notification_sent_at.date() == today_date
    ):
        return

    current_income = get_current_month_income(
        db,
        user,
    )

    monthly_goal = Decimal(user.monthly_income_goal)

    if current_income >= monthly_goal:
        if (
            user.last_goal_celebration_sent_at
            and user.last_goal_celebration_sent_at.month == today.month
            and user.last_goal_celebration_sent_at.year == today.year
        ):
            return

        title, body = build_goal_reached_message()

        await send_push_notification(
            token=user.expo_push_token,
            title=title,
            body=body,
        )

        user.last_goal_celebration_sent_at = today
        db.commit()

        return

    expected_income = get_expected_monthly_income(
        monthly_goal
    )

    if current_income >= expected_income:
        return

    difference = (
        expected_income - current_income
    ).quantize(Decimal("0.01"))

    percent = (
        (current_income / monthly_goal)
        * Decimal("100")
    ).quantize(Decimal("1"))

    days_in_month = monthrange(
        today.year,
        today.month,
    )[1]

    days_remaining = days_in_month - today.day

    if days_remaining <= 3:
        title, body = build_end_of_month_message(
            days_remaining,
            difference,
        )
    else:
        title, body = build_goal_reminder_message(
            difference,
            percent,
        )

    await send_push_notification(
        token=user.expo_push_token,
        title=title,
        body=body,
    )

    user.last_goal_notification_sent_at = today
    db.commit()