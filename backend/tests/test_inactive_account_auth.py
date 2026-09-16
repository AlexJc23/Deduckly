import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.dependencies.auth import get_current_user


class InactiveAccountAuthTests(unittest.TestCase):

    def test_inactive_user_is_rejected(self):
        user = SimpleNamespace(
            id=42,
            is_active=False,
        )

        with (
            patch(
                "app.api.dependencies.auth.decode_access_token",
                return_value={
                    "sub": "42",
                    "type": "access",
                },
            ),
            patch(
                "app.api.dependencies.auth.get_user",
                return_value=user,
            ),
        ):
            with self.assertRaises(HTTPException) as context:
                get_current_user(
                    token="valid-token",
                    db=object(),
                )

        self.assertEqual(
            context.exception.status_code,
            401,
        )

        self.assertEqual(
            context.exception.detail,
            "Account is inactive",
        )

    def test_active_user_is_allowed(self):
        user = SimpleNamespace(
            id=42,
            is_active=True,
        )

        with (
            patch(
                "app.api.dependencies.auth.decode_access_token",
                return_value={
                    "sub": "42",
                    "type": "access",
                },
            ),
            patch(
                "app.api.dependencies.auth.get_user",
                return_value=user,
            ),
        ):
            result = get_current_user(
                token="valid-token",
                db=object(),
            )

        self.assertIs(
            result,
            user,
        )


if __name__ == "__main__":
    unittest.main()
    