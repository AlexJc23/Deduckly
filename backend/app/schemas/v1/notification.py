from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from pydantic import BaseModel, field_validator


class PushTokenUpdate(BaseModel):
    expo_push_token: str | None
    timezone: str | None = None

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value):
        if value is not None:
            try:
                ZoneInfo(value)
            except (ZoneInfoNotFoundError, ValueError):
                raise ValueError("A valid IANA timezone is required")
        return value
