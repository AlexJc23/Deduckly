"""update user and expense models

Revision ID: 6ce4313fe3c8
Revises: ba27e3680779
Create Date: 2026-07-14 21:30:47.274844
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "6ce4313fe3c8"
down_revision: Union[str, Sequence[str], None] = "ba27e3680779"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


business_type_enum = postgresql.ENUM(
    "gig_driver",
    "freelancer",
    "small_business",
    "contractor",
    "other",
    name="business_type_enum",
)

tax_method_enum = postgresql.ENUM(
    "standard_mileage",
    "actual_expenses",
    name="tax_method_enum",
)


def upgrade() -> None:
    """Upgrade schema."""

    bind = op.get_bind()

    # Create PostgreSQL enum types first
    business_type_enum.create(bind, checkfirst=True)
    tax_method_enum.create(bind, checkfirst=True)

    op.add_column(
        "expenses",
        sa.Column(
            "business_percentage",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
        ),
    )

    op.add_column(
        "expenses",
        sa.Column(
            "merchant",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "business_type",
            business_type_enum,
            server_default=sa.text("'other'"),
            nullable=False,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "tax_method",
            tax_method_enum,
            server_default=sa.text("'standard_mileage'"),
            nullable=False,
        ),
    )

    op.alter_column(
        "users",
        "filing_status",
        existing_type=postgresql.ENUM(
            "single",
            "married_filing_jointly",
            "married_filing_separately",
            "head_of_household",
            "qualifying_surviving_spouse",
            name="filingstatus",
        ),
        nullable=False,
        existing_server_default=sa.text("'single'::filingstatus"),
    )


def downgrade() -> None:
    """Downgrade schema."""

    bind = op.get_bind()

    op.alter_column(
        "users",
        "filing_status",
        existing_type=postgresql.ENUM(
            "single",
            "married_filing_jointly",
            "married_filing_separately",
            "head_of_household",
            "qualifying_surviving_spouse",
            name="filingstatus",
        ),
        nullable=True,
        existing_server_default=sa.text("'single'::filingstatus"),
    )

    op.drop_column("users", "tax_method")
    op.drop_column("users", "business_type")

    op.drop_column("expenses", "merchant")
    op.drop_column("expenses", "business_percentage")

    # Drop enum types after dropping the columns
    tax_method_enum.drop(bind, checkfirst=True)
    business_type_enum.drop(bind, checkfirst=True)