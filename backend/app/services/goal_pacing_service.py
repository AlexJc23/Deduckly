from calendar import monthrange
from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo


def get_expected_monthly_income(
    monthly_goal: Decimal,
) -> Decimal:
    now = datetime.now(
        ZoneInfo("America/New_York")
    )

    days_in_month = monthrange(
        now.year,
        now.month,
    )[1]

    day_of_month = now.day

    expected_income = (
        monthly_goal * Decimal(day_of_month)
    ) / Decimal(days_in_month)

    return expected_income.quantize(
        Decimal("0.01")
    )