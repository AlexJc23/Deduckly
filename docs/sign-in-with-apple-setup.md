# Sign in with Apple — deployment checklist

Implementation is local only. No production migration, Apple Developer account change, deployment or App Store upload has been performed.

## Backend first

1. Enable Sign in with Apple for the existing App ID `com.karlsonworks.deduckly` in Apple Developer. Create a Sign in with Apple key associated with that App ID.
2. Add the following to the backend secret manager/environment (never the frontend or a committed file):
   - `APPLE_CLIENT_ID=com.karlsonworks.deduckly`
   - `APPLE_TEAM_ID`: Apple Developer team ID
   - `APPLE_KEY_ID`: the Sign in with Apple key ID
   - `APPLE_PRIVATE_KEY`: contents of its `.p8` key, with real newlines or escaped `\n`
   - Keep the existing `FERNET_KEY` stable; Apple refresh tokens use the same established server encryption helper.
3. Back up the database, then run `alembic upgrade head` as part of the backend deployment. The new revision `c72d93e4a102` adds a nullable encrypted refresh-token column to `user_oauth`. Apply it before running the updated application. It does not change existing users or goals.
4. Deploy the backend. `POST /api/v1/auth/apple/challenge` should return a challenge and nonce. Missing credentials deliberately return 503. Do not ship a client advertising Apple login until the backend is ready.

## iOS build and submission

The Expo plugin, native entitlement and SDK-compatible module are configured. Refresh the App Store distribution provisioning profile so it includes Sign in with Apple. Create a new signed archive with a new build number, validate it, and test through TestFlight before replacing the submitted build. The existing submitted binary will not receive this native change automatically.

## Test with Apple sandbox/TestFlight accounts

- First Apple sign-in using Share My Email and Hide My Email; finish onboarding.
- Returning Apple sign-in when Apple no longer supplies a name.
- Cancel the Apple dialog: no error alert or account creation.
- Existing Deduckly 2FA remains required for Apple accounts that enable it.
- If an email belongs to an existing email/Google account, Apple sign-in explains that the existing sign-in method must be used. This implementation intentionally does not silently merge accounts. Google and email sign-in remain available.
- Delete an Apple-created account: revoke its Apple token before database deletion, and return to login. If Apple revocation fails, retain the account and show a retry message.
- Deletion does not cancel App Store billing. Check the cancellation disclosure.
- Purchase and restore: success, no active subscription, cancellation, and failed network requests; check English/Spanish and both themes on small phones/iPad.

Apple refresh tokens are encrypted at rest and never returned to the client. Native authorization codes are exchanged server-side, and signed Apple identity claims must match the nonce, app identifier, issuer and expiry. The authorization-code exchange prevents reuse of an already-consumed code.

Useful references: https://docs.expo.dev/versions/v54.0.0/sdk/apple-authentication/ and https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple

## Validation completed

- 14 backend regression tests passed using synthetic tokens/mocked Apple requests, including wrong signature/nonce/audience/issuer/expiry, consumed codes, account conflicts, disabled accounts, returning users, revocation failure, and 2FA enforcement. Normal API authentication now rejects temporary 2FA tokens; full access tokens still work.
- Frontend TypeScript and language/onboarding/theme regression scripts passed. Targeted ESLint had no errors; one pre-existing confetti hook dependency warning remains. Native plist checks and git whitespace checks passed.
- Unsigned iOS Release build succeeded with zero error lines, including ExpoAppleAuthentication. Log: `/tmp/deduckly-apple-release.log`.
- Live Apple login, private-email relay delivery, signed archive validation, and TestFlight purchase/restore still require the configuration and device checks above. Register the outbound email domain/sender with Apple’s private email relay if Deduckly sends email to Apple relay addresses.
