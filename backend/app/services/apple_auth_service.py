"""Native Apple authorization-code exchange. Apple credentials stay server-side."""

import secrets
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import HTTPException
from jose import JWTError, jwt
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decrypt_secret, encrypt_secret
from app.models.user import User
from app.models.user_oauth import UserOAuth


APPLE = "https://appleid.apple.com"


def ensure_configured():
    if not all(
        (
            settings.apple_client_id,
            settings.apple_team_id,
            settings.apple_key_id,
            settings.apple_private_key,
        )
    ):
        raise HTTPException(
            status_code=503,
            detail="Sign in with Apple is temporarily unavailable.",
        )


def client_secret():
    ensure_configured()

    now = datetime.now(timezone.utc)

    private_key = settings.apple_private_key.replace("\\n", "\n").strip()

    print("APPLE DEBUG: client id:", settings.apple_client_id)
    print("APPLE DEBUG: team id:", settings.apple_team_id)
    print("APPLE DEBUG: key id:", settings.apple_key_id)
    print(
        "APPLE DEBUG: private key framing:",
        private_key.startswith("-----BEGIN PRIVATE KEY-----"),
        private_key.endswith("-----END PRIVATE KEY-----"),
    )

    return jwt.encode(
        {
            "iss": settings.apple_team_id,
            "iat": now,
            "exp": now + timedelta(minutes=5),
            "aud": APPLE,
            "sub": settings.apple_client_id,
        },
        private_key,
        algorithm="ES256",
        headers={
            "kid": settings.apple_key_id,
        },
    )


def create_challenge():
    ensure_configured()

    nonce = secrets.token_urlsafe(32)

    challenge = jwt.encode(
        {
            "nonce": nonce,
            "aud": "deduckly-apple-login",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        },
        settings.secret_key,
        algorithm="HS256",
    )

    return {
        "nonce": nonce,
        "challenge": challenge,
    }


def decode_challenge(token):
    try:
        claims = jwt.decode(
            token,
            settings.secret_key,
            algorithms=["HS256"],
            audience="deduckly-apple-login",
            options={
                "require_exp": True,
                "require_aud": True,
            },
        )

        nonce = claims.get("nonce")

        if not isinstance(nonce, str) or not nonce:
            raise ValueError("Challenge is missing nonce.")

        print("APPLE DEBUG: challenge valid")

        return nonce

    except (JWTError, ValueError) as exc:
        print("APPLE DEBUG: challenge failed:", repr(exc))

        raise HTTPException(
            status_code=401,
            detail="Apple sign-in expired. Please try again.",
        )


def verify_identity(token, keys, nonce, access_token):
    try:
        header = jwt.get_unverified_header(token)

        print(
            "APPLE DEBUG: identity token header:",
            {
                "alg": header.get("alg"),
                "kid": header.get("kid"),
            },
        )

        if header.get("alg") != "RS256":
            raise ValueError(
                "Unexpected Apple identity-token algorithm."
            )

        key = next(
            key
            for key in keys["keys"]
            if key.get("kid") == header.get("kid")
            and key.get("kty") == "RSA"
        )

        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.apple_client_id,
            issuer=APPLE,
            access_token=access_token,
            options={
                "require_exp": True,
                "require_sub": True,
                "require_aud": True,
                "require_iss": True,
            },
        )

        token_nonce = str(claims.get("nonce", ""))

        print("APPLE DEBUG: identity token decoded")
        print("APPLE DEBUG: audience:", claims.get("aud"))
        print("APPLE DEBUG: issuer:", claims.get("iss"))
        print("APPLE DEBUG: nonce present:", bool(token_nonce))
        print("APPLE DEBUG: expected nonce present:", bool(nonce))

        if not secrets.compare_digest(token_nonce, nonce):
            print("APPLE DEBUG: NONCE MISMATCH")

            raise ValueError(
                "Apple identity-token nonce does not match challenge nonce."
            )

        print("APPLE DEBUG: identity verified")

        return claims

    except (
        JWTError,
        ValueError,
        KeyError,
        StopIteration,
        TypeError,
    ) as exc:
        print(
            "APPLE DEBUG: identity verification failed:",
            repr(exc),
        )

        raise HTTPException(
            status_code=401,
            detail="We couldn’t verify your Apple sign-in. Please try again.",
        )

async def exchange_code(code, challenge):
    nonce = decode_challenge(challenge)
    secret = client_secret()

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                f"{APPLE}/auth/token",
                data={
                    "client_id": settings.apple_client_id,
                    "client_secret": secret,
                    "code": code,
                    "grant_type": "authorization_code",
                },
            )

            print(
                "APPLE DEBUG: token response:",
                response.status_code,
                response.text,
            )

            if response.status_code == 400:
                raise HTTPException(
                    status_code=401,
                    detail="Apple sign-in failed.",
                )

            response.raise_for_status()

            tokens = response.json()

            print(
                "APPLE DEBUG: token exchange succeeded:",
                list(tokens.keys()),
            )

            keys_response = await client.get(
                f"{APPLE}/auth/keys"
            )

            keys_response.raise_for_status()

            claims = verify_identity(
                tokens["id_token"],
                keys_response.json(),
                nonce,
                tokens["access_token"],
            )

            refresh = tokens.get("refresh_token")

            if not isinstance(refresh, str) or not refresh:
                print(
                    "APPLE DEBUG: no refresh token returned"
                )

                raise ValueError(
                    "Apple did not return a refresh token."
                )

            print("APPLE DEBUG: refresh token received")

            return claims, encrypt_secret(refresh)

    except HTTPException:
        raise

    except (
        httpx.HTTPError,
        KeyError,
        ValueError,
    ) as exc:
        print(
            "APPLE DEBUG: token exchange failed:",
            repr(exc),
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Sign in with Apple is temporarily unavailable. "
                "Please try again."
            ),
        )


def save_apple_user(
    db: Session,
    claims,
    encrypted_refresh,
    first_name=None,
    last_name=None,
):
    oauth = (
        db.query(UserOAuth)
        .filter(
            UserOAuth.provider == "apple",
            UserOAuth.provider_user_id == claims["sub"],
        )
        .first()
    )

    if oauth:
        if not oauth.user.is_active:
            raise HTTPException(
                status_code=403,
                detail="This account is unavailable.",
            )

        oauth.apple_refresh_token = encrypted_refresh

        db.commit()

        return oauth.user

    email = claims.get("email")

    if (
        not isinstance(email, str)
        or not email
        or len(email) > 100
        or claims.get("email_verified") not in (True, "true")
    ):
        raise HTTPException(
            status_code=401,
            detail=(
                "Apple did not provide a verified "
                "email address."
            ),
        )

    # Do not silently link an Apple identity to an
    # existing account by email.
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail=(
                "An account already uses this email. "
                "Please use your existing sign-in method."
            ),
        )

    user = User(
        email=email,
        first_name=(first_name or "")[:50],
        last_name=(last_name or "")[:50],
        hashed_password=None,
        email_verified=True,
        is_active=True,
    )

    try:
        db.add(user)
        db.flush()

        db.add(
            UserOAuth(
                user_id=user.id,
                provider="apple",
                provider_user_id=claims["sub"],
                apple_refresh_token=encrypted_refresh,
            )
        )

        db.commit()
        db.refresh(user)

        return user

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "Your account changed while signing in. "
                "Please try again."
            ),
        )


async def revoke_apple_accounts(user):
    accounts = [
        account
        for account in user.oauth_accounts
        if account.provider == "apple"
    ]

    if not accounts:
        return

    secret = client_secret()

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            for account in accounts:
                if not account.apple_refresh_token:
                    raise ValueError(
                        "Apple refresh token is missing."
                    )

                response = await client.post(
                    f"{APPLE}/auth/revoke",
                    data={
                        "client_id": settings.apple_client_id,
                        "client_secret": secret,
                        "token": decrypt_secret(
                            account.apple_refresh_token
                        ),
                        "token_type_hint": "refresh_token",
                    },
                )

                response.raise_for_status()

    except Exception as exc:
        print(
            "APPLE DEBUG: revocation failed:",
            repr(exc),
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "We couldn’t disconnect Apple. "
                "Please try deleting your account again later."
            ),
        )