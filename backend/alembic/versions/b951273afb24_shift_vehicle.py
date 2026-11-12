"""Capture an optional vehicle on new shifts."""
from alembic import op
import sqlalchemy as sa

revision = "b951273afb24"
down_revision = "ab27d384eb02"
branch_labels = None
depends_on = None


def upgrade():
    # Keep existing shifts and their children in place, including on SQLite.
    op.execute(
        "ALTER TABLE shifts ADD COLUMN vehicle_id VARCHAR(36) "
        "CONSTRAINT fk_shifts_vehicle REFERENCES user_vehicles(id) ON DELETE SET NULL"
    )


def downgrade():
    if op.get_bind().execute(sa.text("SELECT 1 FROM shifts WHERE vehicle_id IS NOT NULL LIMIT 1")).first():
        raise RuntimeError("Preserve shift vehicle assignments before downgrade")
    if op.get_bind().dialect.name != "sqlite":
        op.drop_constraint("fk_shifts_vehicle", "shifts", type_="foreignkey")
    op.drop_column("shifts", "vehicle_id")
