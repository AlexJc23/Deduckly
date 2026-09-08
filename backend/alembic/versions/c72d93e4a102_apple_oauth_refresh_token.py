"""Store encrypted Apple refresh tokens for account-deletion revocation."""
from alembic import op
import sqlalchemy as sa
revision = "c72d93e4a102"
down_revision = "b61a82c3d901"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("user_oauth", sa.Column("apple_refresh_token", sa.Text(), nullable=True))

def downgrade():
    op.drop_column("user_oauth", "apple_refresh_token")
