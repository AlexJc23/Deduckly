"""Track unique goal notification occurrences.

Revision ID: b61a82c3d901
Revises: 7b36ed98b206
"""
from alembic import op
import sqlalchemy as sa

revision = "b61a82c3d901"
down_revision = "7b36ed98b206"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("notification_occurrences",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("kind", sa.String(32), nullable=False),
        sa.Column("period", sa.String(10), nullable=False),
        sa.Column("claimed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("push_token", sa.String(255), nullable=True),
        sa.Column("ticket_id", sa.String(128), nullable=True),
        sa.UniqueConstraint("user_id", "kind", "period", name="uq_notification_occurrence"),
    )


def downgrade():
    op.drop_table("notification_occurrences")
