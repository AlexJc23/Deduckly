from decimal import Decimal

from sqlalchemy import (
    String,
    Integer,
    DateTime,
    Numeric,
    Boolean,
    func,
    true,
    false,
    text,
    Enum as SqlEnum,
)
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.db.base import Base
from app.models.enums import (
    Currency,
    DistanceUnit,
    FilingStatus,
    UserRole,
    BusinessType,
    TaxMethod,
    WeekStartsOn,
)


class User(Base):
    __tablename__ = "users"

    # ------------------------------------------------------------------
    # Identity
    # ------------------------------------------------------------------

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    first_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(500),
        nullable=True,
    )

    revenuecat_user_id: Mapped[str | None] = mapped_column(
        String(1000),
        unique=True,
        nullable=True,
    )

    # ------------------------------------------------------------------
    # Account
    # ------------------------------------------------------------------

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        server_default=true(),
        nullable=False,
    )

    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        server_default=false(),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        SqlEnum(
            UserRole,
            name="user_role_enum",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        server_default=text("'user'"),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Tax Settings
    # ------------------------------------------------------------------

    filing_status: Mapped[FilingStatus] = mapped_column(
        SqlEnum(
            FilingStatus,
            name="filingstatus",
        ),
        server_default=text("'single'"),
        nullable=False,
    )

    business_type: Mapped[BusinessType] = mapped_column(
        SqlEnum(
            BusinessType,
            name="business_type_enum",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        server_default=text("'other'"),
        nullable=False,
    )

    tax_method: Mapped[TaxMethod] = mapped_column(
        SqlEnum(
            TaxMethod,
            name="tax_method_enum",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        server_default=text("'standard_mileage'"),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Goals
    # ------------------------------------------------------------------

    monthly_income_goal: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    weekly_income_goal: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    # ------------------------------------------------------------------
    # Offer Analyzer
    # ------------------------------------------------------------------

    estimated_vehicle_cost_per_mile: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    minimum_profit: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    minimum_hourly_rate: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    minimum_dollars_per_mile: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    preferred_max_distance: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 2),
        nullable=True,
    )

    default_platform: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # ------------------------------------------------------------------
    # Localization
    # ------------------------------------------------------------------

    timezone: Mapped[str] = mapped_column(
        String(50),
        server_default=text("'America/New_York'"),
        nullable=False,
    )

    currency: Mapped[Currency] = mapped_column(
        SqlEnum(
            Currency,
            name="currency_enum",
            values_callable=lambda e: [x.value for x in e],
        ),
        server_default=text("'USD'"),
        nullable=False,
    )

    distance_unit: Mapped[DistanceUnit] = mapped_column(
        SqlEnum(
            DistanceUnit,
            name="distance_unit_enum",
            values_callable=lambda e: [x.value for x in e],
        ),
        server_default=text("'mi'"),
        nullable=False,
    )

    week_starts_on: Mapped[WeekStartsOn] = mapped_column(
        SqlEnum(
            WeekStartsOn,
            name="week_starts_on_enum",
            values_callable=lambda e: [x.value for x in e],
        ),
        server_default=text("'monday'"),
        nullable=False,
    )


 

    # ------------------------------------------------------------------
    # Notifications
    # ------------------------------------------------------------------

    notifications_enabled: Mapped[bool] = mapped_column(
        Boolean,
        server_default=true(),
        nullable=False,
    )

    trip_reminders_enabled: Mapped[bool] = mapped_column(
        Boolean,
        server_default=true(),
        nullable=False,
    )

    goal_reminders_enabled: Mapped[bool] = mapped_column(
        Boolean,
        server_default=true(),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Tracking
    # ------------------------------------------------------------------

    auto_trip_detection: Mapped[bool] = mapped_column(
        Boolean,
        server_default=false(),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Timestamps
    # ------------------------------------------------------------------

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------

    two_factor = relationship(
        "TwoFactorAuth",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    oauth_accounts = relationship(
        "UserOAuth",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    trips = relationship(
        "Trip",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    income = relationship(
        "Income",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    expenses = relationship(
        "Expense",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    subscriptions = relationship(
        "Subscription",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    sessions = relationship(
        "Session",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return (
            f"<User(id={self.id}, "
            f"email='{self.email}', "
            f"is_active={self.is_active})>"
        )