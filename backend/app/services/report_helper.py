from datetime import datetime


def get_report_period(data: dict) -> str:
    # Custom range
    if data.get("start_date") and data.get("end_date"):
        start = datetime.fromisoformat(
            str(data["start_date"])
        ).strftime("%b %d, %Y")

        end = datetime.fromisoformat(
            str(data["end_date"])
        ).strftime("%b %d, %Y")

        return f"{start} - {end}"

    # Daily
    if data.get("day"):
        return datetime(
            data["year"],
            data["month"],
            data["day"],
        ).strftime("%B %d, %Y")

    # Monthly
    if data.get("month"):
        return datetime(
            data["year"],
            data["month"],
            1,
        ).strftime("%B %Y")

    # Yearly
    return str(data["year"])