import importlib.util
import io
from pathlib import Path
from types import SimpleNamespace
import unittest
from alembic.migration import MigrationContext
from alembic.operations import Operations

ROOT = Path(__file__).resolve().parents[1]/"alembic/versions"
def migration(name):
    spec = importlib.util.spec_from_file_location(name, ROOT/name)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result

class FoundationMigrationTests(unittest.TestCase):
    def test_postgres_upgrade_ddl_and_chain_without_database(self):
        trip = migration('e94fb506c324_trip_creation_identity.py')
        push = migration('fa50c617d435_push_token_ownership.py')
        self.assertEqual(trip.down_revision, 'd83ea4f5b213')
        self.assertEqual(push.down_revision, trip.revision)
        output = io.StringIO()
        context = MigrationContext.configure(dialect_name='postgresql', opts={'as_sql': True, 'output_buffer': output})
        for change in (trip, push):
            change.op = Operations(context)
            change.upgrade()
        sql = output.getvalue()
        self.assertIn('UNIQUE (user_id, client_id)', sql)
        self.assertIn('ALTER COLUMN start_address DROP NOT NULL', sql)
        self.assertIn('ALTER COLUMN end_address DROP NOT NULL', sql)
        self.assertIn('CREATE UNIQUE INDEX uq_users_expo_push_token', sql)
        self.assertNotIn('DELETE FROM', sql)
    def test_trip_downgrade_refuses_to_destroy_ungeocoded_data(self):
        change = migration('e94fb506c324_trip_creation_identity.py')
        change.op = SimpleNamespace(get_bind=lambda: SimpleNamespace(execute=lambda _: SimpleNamespace(first=lambda: (1,))))
        with self.assertRaisesRegex(RuntimeError, 'ungeocoded'):
            change.downgrade()

if __name__ == '__main__': unittest.main()
