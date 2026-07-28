"""convert user preference strings to enums

Revision ID: e715ee335422
Revises: f0e68436504f
Create Date: 2026-07-27 23:02:49.355384
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "e715ee335422"
down_revision: Union[str, Sequence[str], None] = "f0e68436504f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


currency_enum = postgresql.ENUM(
    "USD",
    name="currency_enum",
    create_type=True,
)

distance_unit_enum = postgresql.ENUM(
    "mi",
    "km",
    name="distance_unit_enum",
    create_type=True,
)

week_starts_on_enum = postgresql.ENUM(
    "sunday",
    "monday",
    name="week_starts_on_enum",
    create_type=True,
)


def upgrade() -> None:
    bind = op.get_bind()

    currency_enum.create(bind, checkfirst=True)
    distance_unit_enum.create(bind, checkfirst=True)
    week_starts_on_enum.create(bind, checkfirst=True)

    op.alter_column(
        "users",
        "currency",
        existing_type=sa.VARCHAR(length=3),
        type_=currency_enum,
        existing_nullable=False,
        existing_server_default=sa.text("'USD'::character varying"),
        postgresql_using="currency::currency_enum",
    )

    op.alter_column(
        "users",
        "distance_unit",
        existing_type=sa.VARCHAR(length=5),
        type_=distance_unit_enum,
        existing_nullable=False,
        existing_server_default=sa.text("'mi'::character varying"),
        postgresql_using="distance_unit::distance_unit_enum",
    )

    op.alter_column(
        "users",
        "week_starts_on",
        existing_type=sa.VARCHAR(length=10),
        type_=week_starts_on_enum,
        existing_nullable=False,
        existing_server_default=sa.text("'monday'::character varying"),
        postgresql_using="week_starts_on::week_starts_on_enum",
    )

    op.drop_column("users", "dashboard_default_view")


def downgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "dashboard_default_view",
            sa.VARCHAR(length=20),
            server_default=sa.text("'month'"),
            nullable=False,
        ),
    )

    op.alter_column(
        "users",
        "week_starts_on",
        existing_type=week_starts_on_enum,
        type_=sa.VARCHAR(length=10),
        existing_nullable=False,
        existing_server_default=sa.text("'monday'::character varying"),
        postgresql_using="week_starts_on::text",
    )

    op.alter_column(
        "users",
        "distance_unit",
        existing_type=distance_unit_enum,
        type_=sa.VARCHAR(length=5),
        existing_nullable=False,
        existing_server_default=sa.text("'mi'::character varying"),
        postgresql_using="distance_unit::text",
    )

    op.alter_column(
        "users",
        "currency",
        existing_type=currency_enum,
        type_=sa.VARCHAR(length=3),
        existing_nullable=False,
        existing_server_default=sa.text("'USD'::character varying"),
        postgresql_using="currency::text",
    )

    bind = op.get_bind()

    week_starts_on_enum.drop(bind, checkfirst=True)
    distance_unit_enum.drop(bind, checkfirst=True)
    currency_enum.drop(bind, checkfirst=True)