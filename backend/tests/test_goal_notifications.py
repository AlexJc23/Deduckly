from datetime import datetime, timezone
from decimal import Decimal
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, lazyload
from app.models.user import User
from app.models.notification_occurrence import NotificationOccurrence
from app.services.goal_reminder_service import due_reminders, check_goal_reminder, check_notification_receipts
from app.services.notification_message_service import goal_amount
from app.schemas.v1.notification import PushTokenUpdate


def user(**changes):
    values = dict(id=1, notifications_enabled=True, goal_reminders_enabled=True,
                  expo_push_token="ExponentPushToken[test]", timezone="America/New_York",
                  monthly_income_goal=Decimal("3000"), daily_income_goal=Decimal("150"))
    values.update(changes)
    return SimpleNamespace(**values)


def instant(value):
    return datetime.fromisoformat(value).replace(tzinfo=timezone.utc)


class ScheduleTests(unittest.TestCase):
    def test_daily_slots_and_no_old_slots(self):
        for utc_hour, slot in ((12, 8), (16, 12), (20, 16)):
            result = due_reminders(user(), instant(f"2026-09-02T{utc_hour}:00:00"))
            self.assertEqual([x[0] for x in result], [f"daily_{slot}"])
        for hour in (14, 22, 1):
            self.assertEqual(due_reminders(user(), instant(f"2026-09-02T{hour:02}:00:00")), [])

    def test_month_start_and_year_rollover(self):
        for date, period in (("2026-09-01T12:00:00", "2026-09"), ("2027-01-01T13:00:00", "2027-01")):
            result = due_reminders(user(), instant(date))
            self.assertEqual(result[0][:2], ("monthly_kickoff", period))
            self.assertIn("$3,000.00", result[0][2][1])
        self.assertNotIn("monthly_kickoff", [x[0] for x in due_reminders(user(), instant("2026-09-02T12:00:00"))])

    def test_local_timezone_and_dst(self):
        for tz, date in (("Asia/Kathmandu", "2026-09-02T02:15:00"),
                         ("America/New_York", "2026-03-07T13:00:00"),
                         ("America/New_York", "2026-03-08T12:00:00"),
                         ("America/New_York", "2026-11-01T13:00:00")):
            result = due_reminders(user(timezone=tz), instant(date))
            self.assertIn("daily_8", [x[0] for x in result])
        self.assertEqual(due_reminders(user(timezone="bad/zone"), instant("2026-09-02T12:00:00")), [])

    def test_permission_preferences_and_no_token(self):
        for changes in ({"notifications_enabled": False}, {"goal_reminders_enabled": False}, {"expo_push_token": None}):
            self.assertEqual(due_reminders(user(**changes), instant("2026-09-01T12:00:00")), [])

    def test_grace_window_and_no_late_catchup(self):
        self.assertTrue(due_reminders(user(), instant("2026-09-02T12:14:59")))
        self.assertFalse(due_reminders(user(), instant("2026-09-02T12:15:00")))

    def test_missing_and_invalid_goals(self):
        for value in (None, 0, -1, "NaN", "Infinity", "invalid"):
            self.assertIsNone(goal_amount(value))
            messages = due_reminders(user(daily_income_goal=value, monthly_income_goal=value), instant("2026-09-01T12:00:00"))
            for _, _, (_, body) in messages:
                self.assertNotIn("$", body)
                self.assertNotIn("None", body)
        self.assertEqual(goal_amount("150.5"), "$150.50")

    def test_timezone_validation_and_token_removal(self):
        self.assertIsNone(PushTokenUpdate(expo_push_token=None, timezone="Europe/London").expo_push_token)
        with self.assertRaises(ValueError):
            PushTokenUpdate(expo_push_token="test", timezone="not/a/timezone")


class DeliveryTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        User.__table__.create(self.engine)
        NotificationOccurrence.__table__.create(self.engine)
        self.db = Session(self.engine, expire_on_commit=False)
        self.user = User(first_name="Test", last_name="User", email="test@example.com", **vars(user()))
        self.db.add(self.user)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    async def test_persisted_dedup_across_sessions(self):
        with patch("app.services.goal_reminder_service.send_push_notification", new_callable=AsyncMock) as send:
            send.return_value = {"data": {"status": "ok", "id": "ticket"}}
            now = instant("2026-09-01T12:00:00")
            await check_goal_reminder(self.db, self.user, now)
            self.assertEqual(send.await_count, 2)
            self.db.close()
            self.db = Session(self.engine, expire_on_commit=False)
            self.user = self.db.get(User, 1, options=[lazyload("*")])
            await check_goal_reminder(self.db, self.user, now)
            self.assertEqual(send.await_count, 2)
            await check_goal_reminder(self.db, self.user, instant("2026-09-01T16:00:00"))
            self.assertEqual(send.await_count, 3)

    async def test_uncertain_send_is_not_retried(self):
        with patch("app.services.goal_reminder_service.send_push_notification", new_callable=AsyncMock) as send:
            send.side_effect = TimeoutError("Simulated ambiguous delivery")
            now = instant("2026-09-02T12:00:00")
            with self.assertLogs("app.services.goal_reminder_service", level="ERROR"):
                await check_goal_reminder(self.db, self.user, now)
            await check_goal_reminder(self.db, self.user, now)
            self.assertEqual(send.await_count, 1)
            self.assertEqual(self.db.query(NotificationOccurrence).one().status, "uncertain")

    async def test_invalid_device_token_is_removed(self):
        with patch("app.services.goal_reminder_service.send_push_notification", new_callable=AsyncMock) as send:
            send.return_value = {"data": {"status": "error", "details": {"error": "DeviceNotRegistered"}}}
            with self.assertLogs("app.services.goal_reminder_service", level="WARNING"):
                await check_goal_reminder(self.db, self.user, instant("2026-09-02T12:00:00"))
            self.assertIsNone(self.user.expo_push_token)
            self.assertEqual(self.db.query(NotificationOccurrence).one().status, "rejected")

    async def test_receipt_does_not_remove_new_registration(self):
        record = NotificationOccurrence(user_id=1, kind="daily_8", period="2026-09-02",
            claimed_at=instant("2026-09-02T12:00:00"), status="accepted", ticket_id="old-ticket", push_token="old-token")
        self.db.add(record)
        self.db.commit()
        with patch("app.services.goal_reminder_service.get_push_receipts", new_callable=AsyncMock) as receipts:
            receipts.return_value = {"old-ticket": {"status": "error", "details": {"error": "DeviceNotRegistered"}}}
            await check_notification_receipts(self.db, instant("2026-09-02T12:16:00"))
        self.assertEqual(self.user.expo_push_token, "ExponentPushToken[test]")
        self.assertEqual(record.status, "rejected")

    async def test_successful_receipt(self):
        record = NotificationOccurrence(user_id=1, kind="daily_8", period="2026-09-02",
            claimed_at=instant("2026-09-02T12:00:00"), status="accepted", ticket_id="ticket")
        self.db.add(record)
        self.db.commit()
        with patch("app.services.goal_reminder_service.get_push_receipts", new_callable=AsyncMock) as receipts:
            receipts.return_value = {"ticket": {"status": "ok"}}
            await check_notification_receipts(self.db, instant("2026-09-02T12:16:00"))
        self.assertEqual(record.status, "handed_off")


if __name__ == "__main__":
    unittest.main()
