from pydantic import BaseModel
from typing import Literal


class FeedbackCreate(BaseModel):
    type: Literal[
        "bug",
        "feature",
        "general",
    ]

    title: str

    description: str

    platform: str

    os_version: str | None = None

    device_name: str | None = None

    app_version: str | None = None

    build_number: str | None = None


class FeedbackResponse(BaseModel):
    message: str