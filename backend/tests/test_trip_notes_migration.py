"""Migration verification uses only a disposable in-memory SQLite database."""
import importlib.util
from pathlib import Path
import unittest
import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations

class TripNotesMigrationTests(unittest.TestCase):
    def test_upgrade_preserves_legacy_rows_and_downgrade_protects_notes(self):
        path = Path(__file__).parents[1]/"alembic/versions/fa16c273da91_trip_notes.py"
        spec = importlib.util.spec_from_file_location("trip_notes_migration", path)
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)
        engine = sa.create_engine("sqlite://")
        try:
            with engine.begin() as db:
                db.exec_driver_sql("CREATE TABLE trips (id INTEGER PRIMARY KEY, distance_miles NUMERIC NOT NULL)")
                db.exec_driver_sql("INSERT INTO trips VALUES (1, 12.34)")
                with Operations.context(MigrationContext.configure(db)):
                    migration.upgrade()
                    self.assertEqual(db.exec_driver_sql("SELECT notes FROM trips WHERE id=1").scalar(), None)
                    db.exec_driver_sql("INSERT INTO trips (id,distance_miles) VALUES (2,5)")
                    db.exec_driver_sql("UPDATE trips SET notes='Keep me' WHERE id=1")
                    with self.assertRaises(RuntimeError):
                        migration.downgrade()
                    self.assertEqual(db.exec_driver_sql("SELECT notes FROM trips WHERE id=1").scalar(), "Keep me")
                    db.exec_driver_sql("UPDATE trips SET notes=NULL")
                    migration.downgrade()
                    self.assertEqual(db.exec_driver_sql("SELECT COUNT(*) FROM trips").scalar(), 2)
                    self.assertNotIn("notes", {c["name"] for c in sa.inspect(db).get_columns("trips")})
        finally:
            engine.dispose()
