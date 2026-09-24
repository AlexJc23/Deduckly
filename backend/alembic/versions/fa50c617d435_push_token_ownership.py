"""One active account per push destination; ambiguous owners must re-register."""
from alembic import op
import sqlalchemy as sa

revision = "fa50c617d435"
down_revision = "e94fb506c324"
branch_labels = None
depends_on = None


def upgrade():
    # There is no reliable last-registration timestamp. Do not guess a winner.
    # Clear only ambiguous delivery destinations, not preferences or user data.
    op.execute(sa.text("""UPDATE users SET expo_push_token = NULL
        WHERE expo_push_token IN (SELECT expo_push_token FROM users
            WHERE expo_push_token IS NOT NULL GROUP BY expo_push_token HAVING COUNT(*) > 1)"""))
    op.create_index("uq_users_expo_push_token", "users", ["expo_push_token"], unique=True)


def downgrade():
    op.drop_index("uq_users_expo_push_token", table_name="users")
    # Old ambiguous associations cannot safely be reconstructed.
