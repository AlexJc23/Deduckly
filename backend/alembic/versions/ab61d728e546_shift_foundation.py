"""Add isolated Shift, platform history, and segment storage."""
from alembic import op
import sqlalchemy as sa

revision = "ab61d728e546"
down_revision = "fa50c617d435"
branch_labels = None
depends_on = None


def timestamps():
    return [
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    ]


def upgrade():
    op.create_table("shifts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("client_id", sa.String(128), nullable=False),
        sa.Column("planned_end_at", sa.DateTime(timezone=True), nullable=True),
        *timestamps(),
        sa.UniqueConstraint("user_id", "client_id", name="uq_shifts_user_client_id"),
        sa.CheckConstraint("length(client_id) > 0", name="ck_shifts_client_id"),
        sa.CheckConstraint("ended_at IS NULL OR ended_at >= started_at", name="ck_shifts_time_order"),
        sa.CheckConstraint("planned_end_at IS NULL OR planned_end_at >= started_at", name="ck_shifts_planned_end"),
    )
    op.create_index("ix_shifts_user_started_at", "shifts", ["user_id", "started_at"])
    op.create_table("shift_platform_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("shift_id", sa.Integer(), sa.ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("client_id", sa.String(128), nullable=False),
        sa.Column("platform", sa.Enum("UBER_EATS", "SPARK", "DOORDASH", "LYFT", "UBER", "GRUBHUB", "INSTACART", "AMAZON_FLEX", "SHIPT", "OTHER", "PERSONAL", native_enum=False, create_constraint=True, name="ck_shift_platform"), nullable=False),
        *timestamps(),
        sa.UniqueConstraint("shift_id", "client_id", name="uq_shift_platform_sessions_client_id"),
        sa.UniqueConstraint("shift_id", "id", name="uq_shift_platform_sessions_shift_id_id"),
        sa.CheckConstraint("length(client_id) > 0", name="ck_shift_platform_sessions_client_id"),
        sa.CheckConstraint("ended_at IS NULL OR ended_at >= started_at", name="ck_shift_platform_sessions_time_order"),
    )
    op.create_index("ix_shift_platform_sessions_shift_started_at", "shift_platform_sessions", ["shift_id", "started_at"])
    op.create_table("shift_segments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("shift_id", sa.Integer(), sa.ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("client_id", sa.String(128), nullable=False),
        sa.Column("platform_session_id", sa.Integer(), nullable=True),
        sa.Column("distance_miles", sa.Numeric(10, 2), nullable=False),
        sa.Column("category", sa.Enum("BUSINESS", "PERSONAL", native_enum=False, create_constraint=True, name="ck_shift_segment_category"), nullable=False),
        *timestamps(),
        sa.UniqueConstraint("shift_id", "client_id", name="uq_shift_segments_client_id"),
        sa.ForeignKeyConstraint(["shift_id", "platform_session_id"], ["shift_platform_sessions.shift_id", "shift_platform_sessions.id"], name="fk_shift_segments_same_shift_platform"),
        sa.CheckConstraint("length(client_id) > 0", name="ck_shift_segments_client_id"),
        sa.CheckConstraint("ended_at IS NULL OR ended_at >= started_at", name="ck_shift_segments_time_order"),
        sa.CheckConstraint("distance_miles >= 0", name="ck_shift_segments_distance"),
    )
    op.create_index("ix_shift_segments_shift_started_at", "shift_segments", ["shift_id", "started_at"])
    op.create_index("ix_shift_segments_platform_session", "shift_segments", ["shift_id", "platform_session_id"])


def downgrade():
    # Removes only this feature's tables (and their data); existing tables/types remain.
    op.drop_table("shift_segments")
    op.drop_table("shift_platform_sessions")
    op.drop_table("shifts")
