"""add new table for mileage_rate

Revision ID: ef61c0ea7a1c
Revises: 2d2d9cd20afe
Create Date: 2026-05-03 23:32:56.824589
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'ef61c0ea7a1c'
down_revision: Union[str, Sequence[str], None] = '2d2d9cd20afe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        'mileage_rates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('rate', sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False
        ),
        sa.CheckConstraint('rate >= 0', name='ck_rate_non_negative'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('year', name='uq_mileage_rates_year')  # ← important
    )

    op.create_index(op.f('ix_mileage_rates_id'), 'mileage_rates', ['id'], unique=False)
    op.create_index(op.f('ix_mileage_rates_year'), 'mileage_rates', ['year'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(op.f('ix_mileage_rates_year'), table_name='mileage_rates')
    op.drop_index(op.f('ix_mileage_rates_id'), table_name='mileage_rates')
    op.drop_table('mileage_rates')
    # ### end Alembic commands ###
