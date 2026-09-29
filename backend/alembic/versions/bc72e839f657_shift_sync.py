"""Shift revision synchronization and review exclusion."""
from alembic import op
import sqlalchemy as sa
revision = 'bc72e839f657'
down_revision = 'ab61d728e546'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('shifts', sa.Column('revision', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('shifts', sa.Column('sync_fingerprint', sa.String(64), nullable=True))
    op.add_column('shift_segments', sa.Column('excluded', sa.Boolean(), nullable=False, server_default=sa.false()))

def downgrade():
    op.drop_column('shift_segments', 'excluded')
    op.drop_column('shifts', 'sync_fingerprint')
    op.drop_column('shifts', 'revision')
