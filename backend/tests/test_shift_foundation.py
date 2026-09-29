"""Storage constraints tested without application DB/network connections."""
import importlib.util
import io
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
import unittest
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import MetaData, create_engine, event, inspect, select, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models import User, Shift, ShiftPlatformSession, ShiftSegment, TripCategory, TripPlatform


def migration():
    path = Path(__file__).resolve().parents[1] / 'alembic/versions/ab61d728e546_shift_foundation.py'
    spec = importlib.util.spec_from_file_location('shift_migration', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ShiftFoundationTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite://')
        @event.listens_for(self.engine, 'connect')
        def foreign_keys(connection, _):
            connection.execute('PRAGMA foreign_keys=ON')
        User.__table__.create(self.engine)
        with self.engine.begin() as connection:
            change = migration()
            change.op = Operations(MigrationContext.configure(connection))
            change.upgrade()
        self.db = Session(self.engine)
        self.db.add_all([User(id=i, first_name='Test', last_name='User', email=f'{i}@example.com') for i in (1, 2)])
        self.db.commit()
        self.now = datetime(2026, 9, 28, 23, tzinfo=timezone.utc)

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def shift(self, owner=1, client='shift-1', **kwargs):
        row = Shift(user_id=owner, client_id=client, started_at=self.now, **kwargs)
        self.db.add(row)
        self.db.flush()
        return row

    def segment(self, shift, client='segment-1', **kwargs):
        row = ShiftSegment(shift_id=shift.id, client_id=client, started_at=self.now,
            distance_miles=Decimal('2.50'), category=TripCategory.PERSONAL, **kwargs)
        self.db.add(row)
        self.db.flush()
        return row

    def test_active_shift_optional_plan_and_midnight(self):
        row = self.shift(planned_end_at=self.now + timedelta(hours=2))
        other = self.shift(client='no-plan')
        self.db.commit()
        self.assertIsNone(row.ended_at)
        self.assertIsNone(other.planned_end_at)
        self.assertEqual(row.planned_end_at.day, 29)
        row.planned_end_at += timedelta(hours=1)
        self.db.commit()
        self.assertIsNone(row.ended_at)

    def test_owner_scoped_identity_and_queries(self):
        a = self.shift()
        b = self.shift(owner=2)
        self.db.commit()
        self.assertNotEqual(a.id, b.id)
        self.assertEqual(self.db.scalars(select(Shift).where(Shift.user_id == 1)).all(), [a])
        with self.assertRaises(IntegrityError):
            self.shift()
        self.db.rollback()
        self.assertEqual(self.db.get(Shift, a.id).user_id, 1)

    def test_owner_must_exist(self):
        with self.assertRaises(IntegrityError):
            self.shift(owner=99)

    def test_platform_history_and_classification_correction(self):
        row = self.shift()
        for i, platform in enumerate((TripPlatform.SPARK, TripPlatform.DOORDASH, TripPlatform.SPARK)):
            session = ShiftPlatformSession(shift_id=row.id, client_id=f'p-{i}', platform=platform,
                started_at=self.now + timedelta(hours=i), ended_at=self.now + timedelta(hours=i+1))
            self.db.add(session)
            self.db.flush()
            segment = self.segment(row, client=f's-{i}', platform_session_id=session.id)
            segment.started_at = session.started_at
            segment.ended_at = session.ended_at
        self.db.commit()
        self.assertEqual(len(row.platform_sessions), 3)
        self.assertEqual(len(row.segments), 3)
        row.segments[0].category = TripCategory.BUSINESS
        self.db.commit()
        self.db.expire_all()
        self.assertEqual(row.segments[0].category, TripCategory.BUSINESS)
        self.assertEqual(row.segments[1].category, TripCategory.PERSONAL)
        self.assertEqual(row.segments[0].platform_session.shift_id, row.id)

    def test_segment_cannot_reference_another_shift_platform(self):
        for owner in (1, 2):
            with self.subTest(owner=owner):
                a = self.shift(client=f'a-{owner}')
                b = self.shift(owner=owner, client=f'b-{owner}')
                session = ShiftPlatformSession(shift_id=b.id, client_id='platform', platform=TripPlatform.SPARK, started_at=self.now)
                self.db.add(session)
                self.db.commit()
                with self.assertRaises(IntegrityError):
                    self.segment(a, platform_session_id=session.id)
                self.db.rollback()

    def test_relationship_assignment_cannot_move_segment_to_other_owner(self):
        a = self.shift()
        b = self.shift(owner=2)
        segment = self.segment(a)
        platform = ShiftPlatformSession(shift_id=b.id, client_id='p', platform=TripPlatform.SPARK, started_at=self.now)
        self.db.add(platform)
        self.db.commit()
        owner_shift_id = a.id
        segment.platform_session = platform
        with self.assertRaises(IntegrityError):
            self.db.flush()
        self.db.rollback()
        self.assertEqual(segment.shift_id, owner_shift_id)
        self.assertIsNone(segment.platform_session_id)

    def test_duplicate_child_ids_rejected_without_overwrite(self):
        row = self.shift()
        self.segment(row)
        self.db.add(ShiftPlatformSession(shift_id=row.id, client_id='p', platform=TripPlatform.SPARK, started_at=self.now))
        self.db.commit()
        with self.assertRaises(IntegrityError):
            self.segment(row)
        self.db.rollback()
        self.db.add(ShiftPlatformSession(shift_id=row.id, client_id='p', platform=TripPlatform.UBER, started_at=self.now))
        with self.assertRaises(IntegrityError):
            self.db.flush()
        self.db.rollback()
        self.assertEqual(row.platform_sessions[0].platform, TripPlatform.SPARK)
        self.segment(self.shift(client='another'))  # Same child ID, different Shift is valid.

    def test_invalid_values_rejected(self):
        for changes in ({'distance_miles': -1}, {'category': None}, {'category': 'INVALID'}, {'ended_at': self.now-timedelta(seconds=1)}, {'client_id': ''}):
            with self.subTest(changes=changes):
                row = self.shift()
                segment = self.segment(row)
                for name, value in changes.items():
                    setattr(segment, name, value)
                with self.assertRaises(IntegrityError):
                    self.db.flush()
                self.db.rollback()
        for kwargs in ({'ended_at': self.now-timedelta(seconds=1)}, {'planned_end_at': self.now-timedelta(seconds=1)}):
            with self.assertRaises(IntegrityError):
                self.shift(**kwargs)
            self.db.rollback()

    def test_user_delete_cascades_only_own_shift_data(self):
        a = self.shift()
        b = self.shift(owner=2)
        p = ShiftPlatformSession(shift_id=a.id, client_id='p', platform=TripPlatform.SPARK, started_at=self.now)
        self.db.add(p)
        self.db.flush()
        self.segment(a, platform_session_id=p.id)
        self.segment(b)
        self.db.commit()
        self.db.execute(delete(User).where(User.id == 1))
        self.db.commit()
        self.assertEqual(self.db.query(Shift).count(), 1)
        self.assertEqual(self.db.query(ShiftSegment).count(), 1)
        self.assertEqual(self.db.query(ShiftPlatformSession).count(), 0)

    def test_orm_shift_delete_cascades_children(self):
        row = self.shift()
        platform = ShiftPlatformSession(shift_id=row.id, client_id='p', platform=TripPlatform.SPARK, started_at=self.now)
        self.db.add(platform)
        self.db.flush()
        self.segment(row, platform_session_id=platform.id)
        self.db.commit()
        self.assertEqual(len(row.platform_sessions), 1)
        self.assertEqual(len(row.segments), 1)
        self.db.delete(row)
        self.db.commit()
        self.assertEqual(self.db.query(ShiftSegment).count(), 0)

    def test_migration_matches_models_and_reverses_without_touching_users(self):
        metadata = MetaData()
        for model in (User, Shift, ShiftPlatformSession, ShiftSegment):
            model.__table__.to_metadata(metadata)
        with self.engine.begin() as connection:
            self.assertEqual(compare_metadata(MigrationContext.configure(connection), metadata), [])
            change = migration()
            change.op = Operations(MigrationContext.configure(connection))
            change.downgrade()
            self.assertEqual(inspect(connection).get_table_names(), ['users'])
            self.assertEqual(len(connection.execute(select(User.id)).all()), 2)

    def test_postgresql_ddl_is_additive(self):
        change = migration()
        self.assertEqual(change.down_revision, 'fa50c617d435')
        output = io.StringIO()
        change.op = Operations(MigrationContext.configure(dialect_name='postgresql', opts={'as_sql': True, 'output_buffer': output}))
        change.upgrade()
        sql = output.getvalue()
        self.assertEqual(sql.count('CREATE TABLE'), 3)
        self.assertIn('FOREIGN KEY(shift_id, platform_session_id)', sql)
        self.assertIn('TIMESTAMP WITH TIME ZONE', sql)
        self.assertNotIn('ALTER TABLE', sql)
        self.assertNotIn('CREATE TYPE', sql)


if __name__ == '__main__':
    unittest.main()
