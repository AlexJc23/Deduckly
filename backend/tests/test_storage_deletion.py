import unittest
from unittest.mock import patch

from app.services.storage_service import delete_user_files_from_s3


class FakeS3Client:
    def __init__(self):
        self.list_calls = []
        self.delete_calls = []

        self.responses = [
            {
                "Contents": [
                    {"Key": "42/receipt-a.jpg"},
                    {"Key": "42/receipt-b.png"},
                ],
            },
            {
                "Contents": [
                    {"Key": "42/orphaned-receipt.jpg"},
                ],
            },
            {
                "Contents": [],
            },
            {
                "Contents": [],
            },
        ]

    def list_objects_v2(self, **kwargs):
        self.list_calls.append(kwargs)

        return self.responses.pop(0)

    def delete_objects(self, **kwargs):
        self.delete_calls.append(kwargs)

        return {
            "Deleted": kwargs["Delete"]["Objects"],
        }


class StorageDeletionTests(unittest.TestCase):

    def test_deletes_every_object_under_exact_user_prefix(self):
        s3 = FakeS3Client()

        with (
            patch(
                "app.services.storage_service.get_s3_client",
                return_value=s3,
            ),
            patch(
                "app.services.storage_service.settings.s3_bucket",
                "test-bucket",
            ),
        ):
            delete_user_files_from_s3(42)

        self.assertGreaterEqual(
            len(s3.list_calls),
            3,
        )

        for call in s3.list_calls:
            self.assertEqual(
                call["Bucket"],
                "test-bucket",
            )

            self.assertEqual(
                call["Prefix"],
                "42/",
            )

        deleted_keys = [
            item["Key"]
            for call in s3.delete_calls
            for item in call["Delete"]["Objects"]
        ]

        self.assertEqual(
            deleted_keys,
            [
                "42/receipt-a.jpg",
                "42/receipt-b.png",
                "42/orphaned-receipt.jpg",
            ],
        )

        self.assertNotIn(
            "4/",
            [call["Prefix"] for call in s3.list_calls],
        )

        self.assertNotIn(
            "420/",
            [call["Prefix"] for call in s3.list_calls],
        )

    def test_s3_delete_errors_fail_account_cleanup(self):
        class FailingS3Client:
            def list_objects_v2(self, **kwargs):
                return {
                    "Contents": [
                        {"Key": "42/receipt.jpg"},
                    ],
                }

            def delete_objects(self, **kwargs):
                return {
                    "Errors": [
                        {
                            "Key": "42/receipt.jpg",
                            "Code": "AccessDenied",
                        },
                    ],
                }

        with (
            patch(
                "app.services.storage_service.get_s3_client",
                return_value=FailingS3Client(),
            ),
            patch(
                "app.services.storage_service.settings.s3_bucket",
                "test-bucket",
            ),
        ):
            with self.assertRaises(Exception) as context:
                delete_user_files_from_s3(42)

        self.assertEqual(
            getattr(context.exception, "status_code", None),
            500,
        )


if __name__ == "__main__":
    unittest.main()
    