from decimal import Decimal, InvalidOperation


def goal_amount(value):
    try:
        amount = Decimal(str(value))
        if amount.is_finite() and amount > 0:
            return f"${amount:,.2f}"
    except (InvalidOperation, ValueError, TypeError):
        pass
    return None


def build_monthly_kickoff_message(month, goal):
    amount = goal_amount(goal)
    body = (f"{month} is here. Let’s work toward your {amount} income goal this month!"
            if amount else f"{month} is here. Set your monthly income goal in Deduckly and make a fresh start!")
    return "New month, new goal! 🚗", body


def build_daily_goal_message(hour, goal):
    amount = goal_amount(goal)
    target = f"your {amount} income goal" if amount else "your income goals"
    if hour == 8:
        return "Good morning! 🚗", f"A fresh start. Let’s make progress toward {target} today!"
    if hour == 12:
        return "Your midday check-in", f"How’s your day going? Take a moment to check in on {target}."
    return "Let’s finish strong! 🚗", f"There’s still time to make progress toward {target} today."
