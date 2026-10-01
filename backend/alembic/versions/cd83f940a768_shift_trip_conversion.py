"""Durable Shift conversion, preserving legacy segment categories."""
from alembic import op
import sqlalchemy as sa
revision = 'cd83f940a768'
down_revision = 'bc72e839f657'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('shift_segments', sa.Column('reviewed', sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column('shift_segments', sa.Column('save_requested', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('shift_segments', sa.Column('converted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('shift_segments', sa.Column('trip_id', sa.Integer(), nullable=True))
    with op.batch_alter_table('shift_segments') as batch:
        batch.create_foreign_key('fk_shift_segment_trip', 'trips', ['trip_id'], ['id'], ondelete='SET NULL')
        batch.create_unique_constraint('uq_shift_segment_trip', ['trip_id'])
    with op.batch_alter_table('trips') as batch:
        for name in ('start_lat', 'start_lng', 'end_lat', 'end_lng', 'platform'):
            batch.alter_column(name, nullable=True)

def downgrade():
    # Refuse to fabricate missing location/platform data or erase converted trips.
    connection = op.get_bind()
    if connection.execute(sa.text('SELECT count(*) FROM shift_segments WHERE converted_at IS NOT NULL')).scalar():
        raise RuntimeError('Cannot downgrade while converted Shift records exist')
    if connection.execute(sa.text('SELECT count(*) FROM trips WHERE start_lat IS NULL OR start_lng IS NULL OR end_lat IS NULL OR end_lng IS NULL OR platform IS NULL')).scalar():
        raise RuntimeError('Cannot restore required Trip fields while missing values exist')
    with op.batch_alter_table('trips') as batch:
        for name in ('start_lat', 'start_lng', 'end_lat', 'end_lng', 'platform'):
            batch.alter_column(name, nullable=False)
    with op.batch_alter_table('shift_segments') as batch:
        batch.drop_constraint('uq_shift_segment_trip', type_='unique')
        batch.drop_constraint('fk_shift_segment_trip', type_='foreignkey')
        for name in ('trip_id', 'converted_at', 'save_requested', 'reviewed'):
            batch.drop_column(name)
