"""Optional vehicle ownership and per-year reporting assumptions. No backfill."""
from alembic import op
import sqlalchemy as sa
revision='ab27d384eb02'
down_revision='fa16c273da91'
branch_labels=None
depends_on=None

def upgrade():
    for table in ['trips','expenses']:
        with op.batch_alter_table(table) as batch:
            batch.add_column(sa.Column('vehicle_id',sa.String(36),nullable=True))
            batch.create_foreign_key('fk_'+table+'_vehicle','user_vehicles',['vehicle_id'],['id'],ondelete='SET NULL')
            batch.create_index('ix_'+table+'_vehicle_id',['vehicle_id'])
    op.create_table('vehicle_tax_settings',
        sa.Column('id',sa.Integer(),primary_key=True),
        sa.Column('user_id',sa.Integer(),sa.ForeignKey('users.id',ondelete='CASCADE'),nullable=False),
        sa.Column('vehicle_id',sa.String(36),sa.ForeignKey('user_vehicles.id',ondelete='CASCADE'),nullable=False),
        sa.Column('year',sa.Integer(),nullable=False),sa.Column('method',sa.String(30),nullable=False),
        sa.Column('total_miles',sa.Numeric(12,2)),sa.Column('business_miles',sa.Numeric(12,2)),
        sa.Column('ownership',sa.String(10)),sa.Column('first_business_year',sa.Integer()),
        sa.Column('first_method',sa.String(30)),sa.Column('prior_method',sa.String(30)),
        *[sa.Column(k,sa.Boolean()) for k in ['section179','bonus_depreciation','accelerated_depreciation','fleet']],
        sa.UniqueConstraint('user_id','vehicle_id','year',name='uq_vehicle_tax_year'),
        sa.CheckConstraint('total_miles IS NULL OR total_miles > 0',name='ck_vehicle_tax_total'),
        sa.CheckConstraint('business_miles IS NULL OR (total_miles IS NOT NULL AND business_miles >= 0 AND business_miles <= total_miles)',name='ck_vehicle_tax_business'))

def downgrade():
    bind=op.get_bind()
    if bind.execute(sa.text('SELECT 1 FROM vehicle_tax_settings LIMIT 1')).first() or any(bind.execute(sa.text('SELECT 1 FROM '+t+' WHERE vehicle_id IS NOT NULL LIMIT 1')).first() for t in ['trips','expenses']):
        raise RuntimeError('Export vehicle assignments and reporting settings before downgrade')
    op.drop_table('vehicle_tax_settings')
    for table in ['trips','expenses']:
        with op.batch_alter_table(table) as batch:
            batch.drop_index('ix_'+table+'_vehicle_id')
            batch.drop_constraint('fk_'+table+'_vehicle',type_='foreignkey')
            batch.drop_column('vehicle_id')
