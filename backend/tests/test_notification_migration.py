import importlib.util
from pathlib import Path
import unittest
from sqlalchemy import create_engine, inspect, text
from alembic.migration import MigrationContext
from alembic.operations import Operations


class MigrationTests(unittest.TestCase):
    def test_upgrade_unique_constraint_and_downgrade(self):
        path = Path(__file__).resolve().parents[1] / "alembic/versions/b61a82c3d901_add_notification_occurrences.py"
        spec = importlib.util.spec_from_file_location("notification_migration", path)
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)
        engine = create_engine("sqlite://")
        with engine.begin() as connection:
            connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY)"))
            migration.op = Operations(MigrationContext.configure(connection))
            migration.upgrade()
            constraints = inspect(connection).get_unique_constraints("notification_occurrences")
            self.assertEqual(constraints[0]["column_names"], ["user_id", "kind", "period"])
            migration.downgrade()
            self.assertNotIn("notification_occurrences", inspect(connection).get_table_names())
        engine.dispose()
