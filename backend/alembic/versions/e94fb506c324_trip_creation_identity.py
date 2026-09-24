"""Owner-scoped trip creation identity and optional geocoding enrichment."""
from alembic import op
import sqlalchemy as sa

revision = "e94fb506c324"
down_revision = "d83ea4f5b213"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("trips", sa.Column("client_id", sa.String(128), nullable=True))
    op.add_column("trips", sa.Column("creation_fingerprint", sa.String(64), nullable=True))
    op.create_unique_constraint("uq_trips_user_client_id", "trips", ["user_id", "client_id"])
    op.alter_column("trips", "start_address", existing_type=sa.String(100), nullable=True)
    op.alter_column("trips", "end_address", existing_type=sa.String(100), nullable=True)


def downgrade():
    # Do not invent addresses or delete valid ungeocoded mileage on downgrade.
    connection = op.get_bind()
    if connection.execute(sa.text("SELECT 1 FROM trips WHERE start_address IS NULL OR end_address IS NULL LIMIT 1")).first():
        raise RuntimeError("Cannot restore non-null addresses while ungeocoded trips exist")
    op.alter_column("trips", "start_address", existing_type=sa.String(100), nullable=False)
    op.alter_column("trips", "end_address", existing_type=sa.String(100), nullable=False)
    op.drop_constraint("uq_trips_user_client_id", "trips", type_="unique")
    op.drop_column("trips", "creation_fingerprint")
    op.drop_column("trips", "client_id")
