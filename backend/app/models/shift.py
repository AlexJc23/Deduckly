"""Additive Shift storage; deliberately independent of Trip/report accounting."""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (Boolean, CheckConstraint, DateTime, Enum as SqlEnum, ForeignKey,
    ForeignKeyConstraint, Index, Integer, Numeric, String, UniqueConstraint, func)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import TripCategory, TripPlatform


class ShiftTimestamps:
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Shift(ShiftTimestamps, Base):
    __tablename__ = "shifts"
    __table_args__ = (
        UniqueConstraint("user_id", "client_id", name="uq_shifts_user_client_id"),
        CheckConstraint("length(client_id) > 0", name="ck_shifts_client_id"),
        CheckConstraint("ended_at IS NULL OR ended_at >= started_at", name="ck_shifts_time_order"),
        CheckConstraint("planned_end_at IS NULL OR planned_end_at >= started_at", name="ck_shifts_planned_end"),
        Index("ix_shifts_user_started_at", "user_id", "started_at"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    client_id: Mapped[str] = mapped_column(String(128), nullable=False)
    revision: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    sync_fingerprint: Mapped[str | None] = mapped_column(String(64), nullable=True)
    planned_end_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # DB cascades cover account deletion without adding queries to User paths.
    user = relationship("User")
    platform_sessions = relationship("ShiftPlatformSession", back_populates="shift", cascade="all, delete-orphan", passive_deletes=True)
    segments = relationship("ShiftSegment", back_populates="shift", cascade="all, delete-orphan", passive_deletes=True, foreign_keys="ShiftSegment.shift_id")


class ShiftPlatformSession(ShiftTimestamps, Base):
    __tablename__ = "shift_platform_sessions"
    __table_args__ = (
        UniqueConstraint("shift_id", "client_id", name="uq_shift_platform_sessions_client_id"),
        UniqueConstraint("shift_id", "id", name="uq_shift_platform_sessions_shift_id_id"),
        CheckConstraint("length(client_id) > 0", name="ck_shift_platform_sessions_client_id"),
        CheckConstraint("ended_at IS NULL OR ended_at >= started_at", name="ck_shift_platform_sessions_time_order"),
        Index("ix_shift_platform_sessions_shift_started_at", "shift_id", "started_at"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    shift_id: Mapped[int] = mapped_column(ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False)
    client_id: Mapped[str] = mapped_column(String(128), nullable=False)
    platform: Mapped[TripPlatform] = mapped_column(SqlEnum(TripPlatform, native_enum=False, create_constraint=True, name="ck_shift_platform"), nullable=False)
    shift = relationship("Shift", back_populates="platform_sessions")


class ShiftSegment(ShiftTimestamps, Base):
    __tablename__ = "shift_segments"
    __table_args__ = (
        UniqueConstraint("shift_id", "client_id", name="uq_shift_segments_client_id"),
        UniqueConstraint("trip_id", name="uq_shift_segment_trip"),
        ForeignKeyConstraint(["shift_id", "platform_session_id"],
            ["shift_platform_sessions.shift_id", "shift_platform_sessions.id"],
            name="fk_shift_segments_same_shift_platform"),
        CheckConstraint("length(client_id) > 0", name="ck_shift_segments_client_id"),
        CheckConstraint("ended_at IS NULL OR ended_at >= started_at", name="ck_shift_segments_time_order"),
        CheckConstraint("distance_miles >= 0", name="ck_shift_segments_distance"),
        Index("ix_shift_segments_shift_started_at", "shift_id", "started_at"),
        Index("ix_shift_segments_platform_session", "shift_id", "platform_session_id"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    shift_id: Mapped[int] = mapped_column(ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False)
    client_id: Mapped[str] = mapped_column(String(128), nullable=False)
    platform_session_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    distance_miles: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    excluded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    reviewed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    save_requested: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    converted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id", ondelete="SET NULL", name="fk_shift_segment_trip"), nullable=True)
    category: Mapped[TripCategory] = mapped_column(SqlEnum(TripCategory, native_enum=False, create_constraint=True, name="ck_shift_segment_category"), nullable=False)
    shift = relationship("Shift", back_populates="segments", foreign_keys=[shift_id])
    # Only the session ID is writable through this relationship. The composite
    # join checks membership without allowing assignment to move the Shift.
    # A real relationship also orders segment deletes before platform deletes.
    platform_session = relationship(
        "ShiftPlatformSession",
        primaryjoin="and_(ShiftSegment.shift_id == ShiftPlatformSession.shift_id, ShiftSegment.platform_session_id == ShiftPlatformSession.id)",
        foreign_keys=[platform_session_id],
    )
