"""add personal platform

Revision ID: 8012caae5eb3
Revises: a4eb54781901
Create Date: 2026-07-04 09:07:38.297120

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8012caae5eb3'
down_revision: Union[str, Sequence[str], None] = 'a4eb54781901'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TYPE trip_platform ADD VALUE 'PERSONAL';"
    )

def downgrade() -> None:
    # PostgreSQL cannot remove enum values.
    pass
