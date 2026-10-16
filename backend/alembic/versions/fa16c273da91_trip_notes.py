"""Add optional Trip notes; existing rows and client contracts remain valid."""
from alembic import op
import sqlalchemy as sa
revision = 'fa16c273da91'
down_revision = 'ef05b162c980'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('trips', sa.Column('notes', sa.String(2000), nullable=True))

def downgrade():
    # Preserve user-entered notes instead of silently discarding them.
    if op.get_bind().execute(sa.text("SELECT 1 FROM trips WHERE notes IS NOT NULL AND notes <> '' LIMIT 1")).first():
        raise RuntimeError('Export Trip notes before downgrading')
    op.drop_column('trips', 'notes')
