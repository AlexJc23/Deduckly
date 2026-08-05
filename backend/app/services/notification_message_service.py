from decimal import Decimal


def build_goal_reminder_message(
    difference: Decimal,
    percent: Decimal,
) -> tuple[str, str]:
    title = "Monthly Goal Reminder"

    body = (
        f"You're ${difference} behind pace.\n"
        f"You've completed {percent}% of your monthly goal."
    )

    return title, body


def build_goal_reached_message() -> tuple[str, str]:
    return (
        "🎉 Monthly Goal Reached!",
        "Congratulations! You've reached your monthly income goal!",
    )


def build_end_of_month_message(
    days_remaining: int,
    difference: Decimal,
) -> tuple[str, str]:
    return (
        f"{days_remaining} Day{'s' if days_remaining != 1 else ''} Left",
        f"Only ${difference} left to reach your monthly goal!",
    )
