import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1.endpoints.user import delete_user


class FakeQuery:
    def __init__(self, result):
        self.result = result
        self.locked = False

    def filter(self, *args, **kwargs):
        return self

    def with_for_update(self):
        self.locked = True
        return self

    def first(self):
        return self.result


class FakeDB:
    def __init__(self, user):
        self.user = user
        self.query_object = FakeQuery(user)

        self.flushed = False
        self.deleted = None
        self.committed = False
        self.rolled_back = False

    def query(self, model):
        return self.query_object

    def flush(self):
        self.flushed = True

    def delete(self, obj):
        self.deleted = obj

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True


class AccountDeletionTests(
    unittest.IsolatedAsyncioTestCase
):
    async def test_account_deletion_removes_receipts_and_user(self):
        user = SimpleNamespace(
            id=42,
            is_active=True,
        )

        db = FakeDB(user)

        with (
            patch(
                "app.api.v1.endpoints.user.delete_user_files_from_s3"
            ) as delete_files,
            patch(
                "app.api.v1.endpoints.user.revoke_apple_accounts",
                new=AsyncMock(),
            ) as revoke_apple,
        ):
            result = await delete_user(
                db=db,
                current_user=user,
            )

        self.assertTrue(
            db.query_object.locked,
        )

        self.assertTrue(
            db.flushed,
        )

        self.assertFalse(
            user.is_active,
        )

        delete_files.assert_called_once_with(
            42,
        )

        revoke_apple.assert_awaited_once_with(
            user,
        )

        self.assertIs(
            db.deleted,
            user,
        )

        self.assertTrue(
            db.committed,
        )

        self.assertFalse(
            db.rolled_back,
        )

        self.assertEqual(
            result,
            {
                "detail": "User deleted successfully",
            },
        )

    async def test_s3_failure_prevents_database_deletion(self):
        user = SimpleNamespace(
            id=42,
            is_active=True,
        )

        db = FakeDB(user)

        with (
            patch(
                "app.api.v1.endpoints.user.delete_user_files_from_s3",
                side_effect=HTTPException(
                    status_code=500,
                    detail="Failed to delete account receipt files",
                ),
            ),
            patch(
                "app.api.v1.endpoints.user.revoke_apple_accounts",
                new=AsyncMock(),
            ) as revoke_apple,
        ):
            with self.assertRaises(
                HTTPException
            ) as context:
                await delete_user(
                    db=db,
                    current_user=user,
                )

        self.assertEqual(
            context.exception.status_code,
            500,
        )

        self.assertTrue(
            db.rolled_back,
        )

        self.assertIsNone(
            db.deleted,
        )

        self.assertFalse(
            db.committed,
        )

        revoke_apple.assert_not_awaited()

    async def test_missing_locked_user_returns_404(self):
        current_user = SimpleNamespace(
            id=42,
            is_active=True,
        )

        db = FakeDB(None)

        with self.assertRaises(
            HTTPException
        ) as context:
            await delete_user(
                db=db,
                current_user=current_user,
            )

        self.assertEqual(
            context.exception.status_code,
            404,
        )

        self.assertTrue(
            db.rolled_back,
        )


if __name__ == "__main__":
    unittest.main()