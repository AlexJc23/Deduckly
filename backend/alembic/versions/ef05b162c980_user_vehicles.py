"""Add independent, optional vehicle profiles. No existing tables are altered."""
from alembic import op
import sqlalchemy as sa
revision = 'ef05b162c980'
down_revision = 'de94a051b879'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('user_vehicles',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('make', sa.String(100), nullable=False),
        sa.Column('model', sa.String(100), nullable=False),
        sa.Column('trim', sa.String(200)),
        sa.Column('fuel_type', sa.String(20), nullable=False),
        *[sa.Column(field, sa.Float()) for field in ('city_mpg','highway_mpg','combined_mpg','custom_mpg','kwh_per_100_miles')],
        sa.Column('epa_id', sa.String(20)),
        sa.Column('is_default', sa.Boolean(), nullable=False),
        sa.Column('deleted', sa.Boolean(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('operation_id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint('version >= 1', name='ck_vehicle_version'),
        sa.CheckConstraint('year BETWEEN 1886 AND 2200', name='ck_vehicle_year'),
        sa.CheckConstraint("fuel_type IN ('gasoline','diesel','hybrid','electric','other')", name='ck_vehicle_fuel'),
        *[sa.CheckConstraint(f'{field} IS NULL OR ({field} > 0 AND {field} <= 1000)', name=f'ck_vehicle_{field}')
          for field in ('city_mpg','highway_mpg','combined_mpg','custom_mpg','kwh_per_100_miles')])
    op.create_index('ix_user_vehicles_user_id', 'user_vehicles', ['user_id'])
    op.create_index('uq_user_vehicles_default', 'user_vehicles', ['user_id'], unique=True,
                    postgresql_where=sa.text('is_default AND NOT deleted'), sqlite_where=sa.text('is_default AND NOT deleted'))

def downgrade():
    # Do not silently destroy saved vehicle data on rollback.
    if op.get_bind().execute(sa.text('SELECT 1 FROM user_vehicles LIMIT 1')).first():
        raise RuntimeError('Export vehicle profiles before downgrading')
    op.drop_table('user_vehicles')
