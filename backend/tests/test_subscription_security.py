import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.v1.endpoints.subscription import revenuecat_webhook
from app.core.config import settings
from app.services.subscription_service import process_subscription


class FakeQuery:
    def __init__(self, result):
        self.result = result

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.result


class FakeDB:
    def __init__(self, query_result=None):
        self.query_result = query_result

    def query(self, model):
        return FakeQuery(self.query_result)


class SubscriptionSecurityTests(unittest.TestCase):

    def test_webhook_rejects_missing_authorization(self):
        payload = {
            "event": {
                "type": "TEST",
            }
        }

        with patch.object(
            settings,
            "revenuecat_webhook_secret",
            "test-secret",
        ):
            with self.assertRaises(HTTPException) as context:
                revenuecat_webhook(
                    payload=payload,
                    authorization=None,
                    db=FakeDB(),
                )

        self.assertEqual(
            context.exception.status_code,
            401,
        )

    def test_webhook_rejects_wrong_authorization(self):
        payload = {
            "event": {
                "type": "TEST",
            }
        }

        with patch.object(
            settings,
            "revenuecat_webhook_secret",
            "test-secret",
        ):
            with self.assertRaises(HTTPException) as context:
                revenuecat_webhook(
                    payload=payload,
                    authorization="Bearer wrong-secret",
                    db=FakeDB(),
                )

        self.assertEqual(
            context.exception.status_code,
            401,
        )

    def test_webhook_accepts_correct_authorization(self):
        payload = {
            "event": {
                "type": "TEST",
            }
        }

        with patch.object(
            settings,
            "revenuecat_webhook_secret",
            "test-secret",
        ):
            result = revenuecat_webhook(
                payload=payload,
                authorization="Bearer test-secret",
                db=FakeDB(),
            )

        self.assertEqual(
            result,
            {
                "success": True,
                "message": "RevenueCat test webhook received",
            },
        )

    def test_subscription_cannot_update_another_users_transaction(self):
        existing_subscription = SimpleNamespace(
            user_id=1,
        )

        db = FakeDB(
            query_result=existing_subscription,
        )

        with self.assertRaises(HTTPException) as context:
            process_subscription(
                db=db,
                user_id=2,
                data={
                    "original_transaction_id": "existing-transaction",
                },
            )

        self.assertEqual(
            context.exception.status_code,
            409,
        )

        self.assertEqual(
            context.exception.detail,
            "Subscription transaction belongs to another user",
        )


if __name__ == "__main__":
    unittest.main()