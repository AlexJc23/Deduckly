from app.models.user import User
from app.schemas.v1.user import UserResponse
from app.services.subscription_service import is_user_premium


def to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,

        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,

        is_active=user.is_active,
        is_premium=is_user_premium(user),

        filing_status=user.filing_status,
        business_type=user.business_type,
        tax_method=user.tax_method,

        # Goals
        monthly_income_goal=user.monthly_income_goal,
        weekly_income_goal=user.weekly_income_goal,

        # Offer Analyzer
        cost_per_mile=user.estimated_vehicle_cost_per_mile,
        minimum_profit=user.minimum_profit,
        minimum_hourly_rate=user.minimum_hourly_rate,
        minimum_dollars_per_mile=user.minimum_dollars_per_mile,
        preferred_max_distance=user.preferred_max_distance,
        default_platform=user.default_platform,

        # Localization
        timezone=user.timezone,
        currency=user.currency,
        distance_unit=user.distance_unit,
        week_starts_on=user.week_starts_on,

        # Notifications
        notifications_enabled=user.notifications_enabled,
        trip_reminders_enabled=user.trip_reminders_enabled,
        goal_reminders_enabled=user.goal_reminders_enabled,

        # Tracking
        auto_trip_detection=user.auto_trip_detection,

        created_at=user.created_at,
    )