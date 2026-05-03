"""add two new columns to user and fix bracket table

Revision ID: 2d2d9cd20afe
Revises: d442a49a065d
Create Date: 2026-05-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers
revision: str = '2d2d9cd20afe'
down_revision: Union[str, Sequence[str], None] = 'd442a49a065d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ---- CREATE ENUM FIRST (the part you kept skipping) ----
    filing_status_enum = postgresql.ENUM(
        'single',
        'married_filing_jointly',
        'married_filing_separately',
        'head_of_household',
        'qualifying_surviving_spouse',
        name='filingstatus'
    )
    filing_status_enum.create(op.get_bind(), checkfirst=True)

    user_role_enum = postgresql.ENUM(
        'USER',
        'ADMIN',
        name='user_role_enum'
    )
    user_role_enum.create(op.get_bind(), checkfirst=True)

    # ---- ALTER EXISTING COLUMN ----
    op.alter_column(
    'tax_brackets',
    'filing_status',
    existing_type=sa.VARCHAR(),
    type_=sa.Enum(
        'single',
        'married_filing_jointly',
        'married_filing_separately',
        'head_of_household',
        'qualifying_surviving_spouse',
        name='filingstatus'
    ),
    postgresql_using="filing_status::filingstatus",
    existing_nullable=False
)

    # ---- ADD NEW COLUMNS ----
    op.add_column(
        'users',
        sa.Column(
            'role',
            sa.Enum('USER', 'ADMIN', name='user_role_enum'),
            server_default='USER',
            nullable=False
        )
    )

    op.add_column(
        'users',
        sa.Column(
            'filing_status',
            sa.Enum(
                'single',
                'married_filing_jointly',
                'married_filing_separately',
                'head_of_household',
                'qualifying_surviving_spouse',
                name='filingstatus'
            ),
            server_default='single',
            nullable=True
        )
    )


def downgrade() -> None:
    op.drop_column('users', 'filing_status')
    op.drop_column('users', 'role')

    op.alter_column(
        'tax_brackets',
        'filing_status',
        existing_type=sa.Enum(
            'single',
            'married_filing_jointly',
            'married_filing_separately',
            'head_of_household',
            'qualifying_surviving_spouse',
            name='filingstatus'
        ),
        type_=sa.VARCHAR(),
        existing_nullable=False
    )

    # ---- DROP ENUMS (clean exit, unlike before) ----
    op.execute("DROP TYPE IF EXISTS filingstatus")
    op.execute("DROP TYPE IF EXISTS user_role_enum")
    # ### end Alembic commands ###
