"""Add persistent login cooldowns.

Revision ID: c062fa7251ab
Revises: b951273afb24
"""
from alembic import op
import sqlalchemy as sa

revision = "c062fa7251ab"
down_revision = "b951273afb24"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("login_attempts",
                    sa.Column("key", sa.String(64), primary_key=True),
                    sa.Column("failures", sa.Integer(), nullable=False),
                    sa.Column("expires_at", sa.DateTime(), nullable=False))
    op.create_index("ix_login_attempts_expires_at", "login_attempts", ["expires_at"])


def downgrade():
    op.drop_index("ix_login_attempts_expires_at", table_name="login_attempts")
    op.drop_table("login_attempts")
