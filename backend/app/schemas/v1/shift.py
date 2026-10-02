from decimal import Decimal
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, AwareDatetime, model_validator
from app.models.enums import TripCategory, TripPlatform

ClientId = Annotated[str, Field(min_length=1, max_length=128, pattern=r'^[A-Za-z0-9_-]+$')]

class Period(BaseModel):
    model_config = ConfigDict(extra='forbid')
    client_id: ClientId
    started_at: AwareDatetime
    ended_at: AwareDatetime | None = None

    @model_validator(mode='after')
    def ordered(self):
        if self.ended_at and self.ended_at < self.started_at:
            raise ValueError('End precedes start')
        return self

class PlatformPeriod(Period):
    platform: TripPlatform

class Segment(Period):
    start_lat: float | None = Field(default=None, ge=-90, le=90, allow_inf_nan=False)
    start_lng: float | None = Field(default=None, ge=-180, le=180, allow_inf_nan=False)
    end_lat: float | None = Field(default=None, ge=-90, le=90, allow_inf_nan=False)
    end_lng: float | None = Field(default=None, ge=-180, le=180, allow_inf_nan=False)
    start_address: str | None = Field(default=None, max_length=100)
    end_address: str | None = Field(default=None, max_length=100)
    distance_miles: Decimal = Field(ge=0, max_digits=10, decimal_places=2, allow_inf_nan=False)
    category: TripCategory
    platform_client_id: ClientId | None = None
    excluded: bool = False
    # Missing review metadata is legacy data: preserve its existing category.
    reviewed: bool = True
    save_requested: bool = False
    converted_at: AwareDatetime | None = None
    trip_id: int | None = None

class ShiftSnapshot(Period):
    revision: int = Field(ge=0)
    planned_end_at: AwareDatetime | None = None
    platform_sessions: list[PlatformPeriod] = Field(default_factory=list, max_length=1000)
    segments: list[Segment] = Field(default_factory=list, max_length=10000)

    @model_validator(mode='after')
    def relationships(self):
        if self.planned_end_at and self.planned_end_at < self.started_at:
            raise ValueError('Planned end precedes start')
        sessions = {p.client_id: p for p in self.platform_sessions}
        if len(sessions) != len(self.platform_sessions) or len({s.client_id for s in self.segments}) != len(self.segments):
            raise ValueError('Duplicate child identity')
        ordered = sorted(self.platform_sessions, key=lambda p: p.started_at)
        for i, p in enumerate(ordered):
            if i and (ordered[i-1].ended_at is None or ordered[i-1].ended_at > p.started_at):
                raise ValueError('Overlapping platform periods')
        for child in [*self.platform_sessions, *self.segments]:
            if child.started_at < self.started_at or (self.ended_at and (child.ended_at is None or child.ended_at > self.ended_at)):
                raise ValueError('Child outside shift')
        for segment in self.segments:
            if segment.platform_client_id and segment.platform_client_id not in sessions:
                raise ValueError('Unknown platform session')
        return self
