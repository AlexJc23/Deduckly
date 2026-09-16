"""Single-use Google authorization transactions."""
from alembic import op
import sqlalchemy as sa
revision = "d83ea4f5b213"
down_revision = "c72d93e4a102"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("google_oauth_transactions",
        sa.Column("state_hash", sa.String(64), primary_key=True),
        sa.Column("app_challenge", sa.String(43), nullable=False),
        sa.Column("google_verifier", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("exchange_hash", sa.String(64), unique=True, nullable=True),
        sa.Column("identity", sa.JSON(), nullable=True))
    op.create_index("ix_google_oauth_transactions_expires_at", "google_oauth_transactions", ["expires_at"])

def downgrade():
    op.drop_table("google_oauth_transactions")
