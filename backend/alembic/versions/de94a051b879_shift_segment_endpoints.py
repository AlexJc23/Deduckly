"""Optional Shift endpoints; existing Trip contracts remain unchanged."""
from alembic import op
import sqlalchemy as sa
revision = 'de94a051b879'
down_revision = 'cd83f940a768'
branch_labels = None
depends_on = None

def upgrade():
    for name in ('start_lat', 'start_lng', 'end_lat', 'end_lng'):
        op.add_column('shift_segments', sa.Column(name, sa.Numeric(9, 6), nullable=True))
    for name in ('start_address', 'end_address'):
        op.add_column('shift_segments', sa.Column(name, sa.String(100), nullable=True))

def downgrade():
    with op.batch_alter_table('shift_segments') as batch:
        for name in ('start_lat', 'start_lng', 'end_lat', 'end_lng', 'start_address', 'end_address'):
            batch.drop_column(name)
