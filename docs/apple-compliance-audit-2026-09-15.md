# Apple compliance audit — 15 September 2026

Status: **hold resubmission**. This is a source/configuration review with automated checks, not a guarantee of approval or a complete physical-device test. Branch: `android_setup`. No commits, pushes, merges, branch changes, or App Store Connect changes.

## Changes made in this audit

- `backend/app/api/v1/endpoints/auth.py`: Google callback now checks enabled 2FA before issuing a full session; uses the existing restricted temporary token and verification endpoint. Normal Google login remains compatible. Older app versions cannot finish Google 2FA until updated; they receive no full session.
- `frontend/src/features/auth/api/google-auth.api.ts`, `frontend/app/(auth)/login.tsx`, `frontend/app/(auth)/register.tsx`: keep temporary credentials out of persistent session storage and route Google 2FA to the existing verification screen before sign-in.
- `frontend/src/features/auth/services/auth-service.service.ts`, `frontend/src/api/client.ts`: a refresh writes tokens only if its original refresh token still matches inside the existing serialized storage queue. A late response cannot overwrite a newer login or resurrect logout.
- `backend/app/services/subscription_service.py`: canceled renewal retains paid access until expiration in both entitlement checks. Expired status remains denied.
- Tests: `backend/tests/test_google_two_factor.py`, `backend/tests/test_subscription_access.py`, `frontend/scripts/verify-google-auth.cjs`, additions to `frontend/scripts/verify-session-recovery.cjs`.

The backend fixes require deployment separately from an iOS binary. No backend deployment was performed.

## Previously completed Apple rejection fixes, rechecked

The existing iOS-specific onboarding permission component uses Continue, has no initial skip action, and disables navigation gestures/back controls for that explanation. Continue requests the native permission when undetermined. A denial becomes a Settings/informational state with an exit; it does not repeatedly request consent. Background location has separate handling. Camera requests are contextual to receipt capture; photo selection uses the system picker. Notifications use the same iOS explanation rules. No direct microphone, contacts, ATT, Bluetooth, motion, or calendar requests were found in app-owned code. Siri uses the existing App Intents integration rather than an app microphone request.

Location remains necessary for user-started mileage recording. No GPS algorithm, background modes, Apple sign-in implementation, or native iOS file was changed in this renewed audit. Existing native modifications from earlier work remain untouched.

## Release blockers / coordinated work still required

1. **Subscription update trust** (`backend/app/api/v1/endpoints/subscription.py`, `backend/app/services/subscription_service.py`). RevenueCat webhook has no authorization check in the app router, and authenticated `/sync` and `/restore` accept client-supplied subscription state. The service also looks up transactions without constraining the owner. The current frontend sync helper has no callers. Do not treat these endpoints as verified purchases. A deployment/proxy might add protections, but none were verified here.
2. **Receipt deletion** (`backend/app/api/v1/endpoints/user.py`, `backend/app/services/storage_service.py`). Account deletion removes relational records but does not delete S3 receipt objects. Database cascades cannot delete external files. Orphaned receipts and versioned objects must be considered, not just the current expense URLs. Storage permissions and retention configuration were not inspected against production.
3. **Account isolation** (`frontend/src/providers/query.provider.tsx`, auth context, subscription providers). The singleton query cache survives logout/sign-in with unscoped keys such as current-user. RevenueCat identity is not explicitly reset on logout. Account switching and late requests need coordinated cancellation, cache reset, and identity readiness checks before purchases. The new refresh guard fixes one reproduced race, not this entire boundary.
4. **Google OAuth transport/binding** (`backend/app/services/oauth_service.py`, Google callback/client). There is no state/PKCE transaction binding in this flow; full session tokens are returned in a custom-scheme URL. Automatic account linking does not check Google's email_verified flag, and existing OAuth users are not checked for is_active here. The narrow 2FA fix does not resolve these separate issues.

## Concrete follow-up scope requiring approval / external setup

The initial combined auth redesign was rejected by automatic approval review because it could break OAuth, 2FA, refresh, caching, and backend compatibility at once. Two smaller, reproduced auth fixes were subsequently allowed and tested. The larger changes were not applied indirectly.

Proposed separate changes for review:

- **Account isolation:** cancel and clear user queries at explicit login/logout/invalidation boundaries (never on routine refresh); reject stale account responses; bind retried requests to their originating session; serialize RevenueCat identity changes and block purchasing until the correct identity is ready. Preserve owner-scoped offline trips rather than deleting unsynced records on ordinary logout. Tests must cover A→B, logout during fetch/refresh, guest launch, offline recovery, and purchase readiness.
- **Billing verification:** configure a backend-only RevenueCat webhook authorization secret and matching RevenueCat dashboard header; verify it before any event handling. Remove or replace unverified client sync/restore with server-verified entitlements; validate owner/product/environment and out-of-order/duplicate events. Test purchases, cancellations, expirations, restores, transfers, and forged events with a sandbox account. Do not invent or expose credentials.
- **Deletion:** inventory bucket versioning/retention and IAM permissions; delete all receipt keys/versions under the exact user's prefix with error checking, prevent concurrent receipt uploads during deletion, and avoid returning deletion success while required external cleanup failed. Delete only that account's local cached data. Define retention for billing records and RevenueCat data explicitly. Verify with synthetic data in a test bucket/database before production.
- **Google OAuth:** use transaction-bound authorization and a one-use exchange over HTTPS instead of returning full tokens in the deep link; verify identity claims before linking. Plan a compatible server/client rollout and test cancellation, replay, wrong state/verifier, email linking, 2FA, and old clients. Apple OAuth remains unchanged.

No live credentials or real user records were used in tests. These items need coordinated verification, not cosmetic changes to satisfy a warning count.

## Other review areas

- Startup/auth: existing guest invalidation and restoration guards remain; automated session tests pass. No navigation architecture rewrite.
- Subscription UI: native RevenueCat purchase and restore paths, entitlement check, terms/privacy links, and store-derived pricing exist. Real purchase/restore and webhook delivery still need sandbox verification. No external payment checkout was introduced.
- Data/privacy: public legal pages and in-app privacy/terms exist. Match actual location, identifiers, receipts, financial records, analytics and purchase handling against App Store privacy answers and retention statements; an empty collected-data array in the app privacy manifest is not proof that no data is collected.
- iPad/design: existing responsive layouts, theme, language, reports and animation checks pass; no new visual redesign. Physical iPad landscape/small-phone permission and authentication flows remain manual.
- Background tracking: existing persistence/offline recovery checks pass; real locked-screen mileage, prolonged tracking, poor GPS, process termination and reconnection remain device tests.
- Build configuration: existing production bundle/team configuration and version 1.0/build 36 remain. No new archive or upload performed. The earlier archive predates this audit's source changes and must not be presented as containing them.

## Validation

- TypeScript: PASS.
- All ten `frontend/scripts/verify-*.cjs` suites: PASS, including permissions, navigation/session recovery, offline access, trip recovery, theme, language/onboarding, reports, animation boundaries, Android and Google auth.
- Session tests: 15 PASS, including the two added late-success races. Reproduction before fix showed a newer account overwritten.
- Google client: 6 PASS; backend callback: 2 PASS. The enabled-2FA test failed before the fix while ordinary Google login passed.
- Subscription access: 4 PASS. Canceled-but-unexpired access failed before the fix.
- Python tests execute the actual selected functions with mocked dependencies; they are not live HTTP/database/Google/RevenueCat tests.
- Independent read-only review found no concrete bypass/regression within the two narrow auth fixes.
- Application ESLint: 112 pre-existing errors (unescaped legal text) and 33 warnings. Broader script lint also flags pre-existing Node globals. New test's Node global declaration was corrected. No unrelated lint cleanup.
- Expo diagnostics: 18/18 PASS after retrying outside the sandbox DNS restriction.
- Native Info.plist and privacy-manifest syntax: PASS; Podfile.lock matches installed Pods manifest. Changed Python syntax: PASS.
- `git diff --check`: PASS.

Logs: `/tmp/deduckly-apple-full-audit/`.

## Manual App Store Connect actions

- Remove the Yearly subscription's app-icon promotional image and disable promotion if unused, or replace it with distinct 1024×1024 subscription artwork. Do not change the normal app icon or remove the review screenshot as a substitute.
- Check Monthly and Yearly products, agreements, pricing, availability and review attachments.
- Verify privacy answers, privacy URL, and the applicable EULA link in the App Description/custom agreement.
- Provide a working reviewer account and clear instructions for any required 2FA access.
- After remaining blockers are resolved and backend deployed, create and test a fresh Release archive. If build 36 has already been uploaded, use the next valid build number. Upload and review submission are separate actions.

Reference: https://developer.apple.com/app-store/review/guidelines/ (reviewed 15 September 2026), especially app completeness, subscriptions, login services and privacy.
