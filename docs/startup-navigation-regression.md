# Startup navigation regression and release audit

Audit date: 2026-09-11. Base dev: `91e4d6a3511f7c55cd9f2fb07d0f02cc85398e7b`.

## Regression source

Introducing commit: `cf17239dabdf28d6719a17aeb96aea9c154de7ee`,
`fix: restore offline trip access and recover interrupted tracking` (merged by PR 38).
The previous comparison point is its parent, `a0b91ce`, not an assumed first-parent culprit.

That commit changed 30 files. Run `git show --stat cf17239` for the complete inventory.
The causal changes are `frontend/src/api/client.ts`,
`frontend/src/features/auth/services/auth-service.service.ts`, and
`frontend/src/features/auth/context/auth.context.tsx`.
Other changes included onboarding/offline gates, tracking journals, background GPS,
Siri startup, native configuration, translations, dependencies, tests and documentation.
No default-platform change was responsible.

The purpose was legitimate: let an expired/revoked session escape the account-loading
error screen while preserving tokens during network outages and protecting newer
sessions from late responses. The new invalidation event accidentally included
requests that never belonged to any session.

## Real startup flow

1. `app/_layout.tsx`: QueryProvider -> AuthProvider -> TrackingProvider ->
   SubscriptionProvider -> Stack. NotificationSync and SiriStartup also mount.
2. AuthProvider reads SecureStore asynchronously, then finishes `isLoading`.
3. `app/index.tsx` mounts AuthGate. When hydration finishes, its effect replaces
   the index with Login or Dashboard. Navigating away unmounts this gate.
4. SubscriptionProvider independently calls `useCurrentUser()` with no enabled
   condition. The shared QueryClient has default retries. The installed query-core
   retryer uses three retries on non-server environments.
5. Logged-out `/api/v1/users/me` fails with 401. The Axios response interceptor has
   no Bearer token, so `requestToken` is null. Missing refresh credentials produce
   ERR_SESSION_EXPIRED, which calls `invalidateSessionForToken(null)`.
6. Before this fix, `getAccessToken() !== expectedToken` compared null with null
   and did not return. `eraseTokens()` paused recording, deleted credentials,
   and notified AuthProvider even though no session existed.
7. AuthProvider's listener sets `sessionInvalidated=true`. Its navigation-ready
   effect calls `router.replace("/(auth)/login")`, then resets that flag.
8. Query retries repeat the event and effect. The root provider outlives Login and
   Register, so it overrides a user's Create Account push. It settles when retries
   stop. Startup exposes it particularly clearly; a later guest refetch could also
   reproduce it, so it was not strictly limited to initial startup.

Additional automatic navigation decisions:

- `(auth)/_layout.tsx` is a plain Stack; no auth redirect there.
- OnboardingGate, mounted under tabs, redirects unauthenticated/invalid access to
  Login, incomplete setup to onboarding, or renders dashboard/offline access.
  Its NetInfo/AppState checks can rerun on connectivity/foreground changes.
- `app/onboarding.tsx` guards unauthenticated entry and completed setup.
- SiriStartup and the Siri startup hook navigate to active tracking only after a
  pending intent and successful account-ready trip start. They do not send users
  to Login. Existing timers were not changed.
- Email verification navigates after successful verification; password reset,
  login, Apple/Google success, 2FA completion and onboarding completion navigate
  in response to their specific user/action results, not ordinary logged-out startup.
- Root trip synchronization can also encounter auth failures; the same service
  guard protects guest requests from that path.

## Before, bad change, fix

Before cf17239, guest requests could already fail/retry, but clearTokens did not
notify AuthProvider or initiate navigation. The startup AuthGate chose Login once.
After cf17239, those guest failures became global navigation events.

The fix requires a nonempty expected token AND equality with the stored token
inside the existing serialized mutation. It changes one runtime condition.
Missing sessions cannot be invalidated; old sessions cannot clear newer logins;
concurrent real-session invalidations emit once. Explicit clearTokens/logout still
works. No timeout, animation changes, query policy changes, auth rewrite, GPS changes,
or backend changes are part of this patch.

## Executed verification

The new session tests failed before the fix: four guest invalidations instead of
zero. All 13 session checks now pass, including guest retries, late guest failure,
concurrent expiry, explicit logout, refresh failures, and offline preservation.

`frontend/scripts/diagnose-startup-navigation.cjs` executes the real AuthProvider,
AuthGate and API/service code against three revisions with mocked native storage,
HTTP and routing. React effects are mounted, not inferred from string searches.
Four guest failures are driven explicitly; this does not exercise React Query's
actual timers or native stack animation.

| Revision | Login replacements | Route after opening Register and guest failures |
| --- | --- | --- |
| a0b91ce | 1 | Register |
| cf17239 | 5 | Login |
| fixed working tree | 1 | Register |

The same mounted harness passes Register -> Login, token save/signIn, logged-in
cold restoration and one AuthProvider logout replacement. It does not mount the
complete native tab stack or prove animation behavior on a device.

To repeat without modifying application dependencies:

```sh
npm install --prefix /tmp/deduckly-navigation-test --no-audit --no-fund react-test-renderer@19.1.0
DEDUCKLY_TEST_MODULES=/tmp/deduckly-navigation-test/node_modules node frontend/scripts/diagnose-startup-navigation.cjs
node frontend/scripts/verify-session-recovery.cjs
```

The renderer prints its deprecation notice; it is a temporary diagnostic tool,
not a new production dependency.

Other results:

- TypeScript `tsc --noEmit`: PASS.
- All seven existing `verify-*.cjs` scripts: PASS (session, trip recovery,
  offline access, language/onboarding, theme, reports, animation boundaries).
- Expo Doctor: PASS, 18/18 checks.
- Unsigned iOS Release build: PASS, Xcode 26.6, generic iOS device destination.
  Signed archive validation/upload was NOT performed.
- Expo lint: FAIL, 112 errors / 33 warnings. Same results on archived cf17239
  using the same `src app` scope. Pre-existing; no new lint errors. Not evidence
  of a new build/runtime failure, but still an outstanding quality check.
- Backend Apple unittest suite: FAIL, 14 tests executed / seven error reports
  (including subtests). Existing test calls omit verify_identity's required
  access_token argument. Backend code/tests were unchanged by the regression
  commit or this fix. These failures prevent claiming Apple validation is complete.
- Physical iPhone/iPad animations, live Google/Apple authorization, full 2FA,
  signed archive and StoreKit sandbox flows: NOT RUN. Must verify before release.

## Separate release-readiness audit

### Fix now / before release

1. `backend/app/services/apple_auth_service.py`, exchange_code: prints the full
   Apple token response body. A successful body includes sensitive tokens. Remove
   that logging and assess previously retained logs/access before release.
2. `backend/app/api/v1/endpoints/auth.py`, google_callback: directly issues access
   and refresh credentials without checking the app's 2FA configuration.
   Google authorization also lacks a visible state/PKCE transaction binding in
   `oauth_service.py`. This needs a focused security correction and end-to-end test;
   this patch does not introduce or resolve it.
3. Account switching needs a dedicated cache-isolation check: QueryProvider has a
   persistent singleton and a shared current-user key; signOut does not clear that
   cache or call RevenueCat logOut. Cached account/premium data can remain until
   refetch. Do not treat a successful navigation test as proof of account isolation.
4. Repair the stale Apple tests and complete live auth validation before shipping.
5. If using EAS production, eas.json pins Xcode 16.4. Apple currently requires
   Xcode 26 / iOS 26 SDK or later for uploads. Local Xcode 26.6 passes this check;
   the older EAS image must be updated before an EAS submission.

These findings are deliberately separate from the small navigation fix. Merging
this patch to dev is not a release approval. No backend/security cleanup was mixed in.

### Manual App Store Connect / device verification

- Correct new build selected; review account works after reinstall and update;
  cold launch A-I on small iPhone and iPad, online, offline, expired tokens,
  immediate Create Account tap and logout from tabs.
- Apple entitlement and provisioning profile, backend Apple credentials and
  deployed refresh-token migration, cancellation/private relay/repeat login and
  account deletion/revocation. Frontend Apple button and temporary-2FA flow exist.
- Google production callback/client configuration and cancellation/deep-link handling.
- API URL and RevenueCat public SDK key in the actual release environment. The
  frontend falls back to localhost when the API variable is missing. Local build
  loads .env, which does not verify remote EAS configuration.
- RevenueCat offering/products, exact `Deduckly Pro` entitlement, backend webhook
  synchronization to is_premium, purchase/cancel/restore/expiry and account switching.
  Restore UI exists; successful customer info does not alone prove server premium sync.
- EULA link in product description or custom EULA, privacy URL, subscription prices,
  durations, agreements/tax/banking, app privacy answers and reviewer notes.
- Native location purpose strings and background location mode are present. Verify
  denied/when-in-use/always permissions, locked-screen tracking, interrupted-trip
  recovery and offline behavior on a device. iOS can still terminate the process.
- Siri/App Intents compile; verify provisioned Siri/App Group permissions and
  start/stop/cancel with a real device and signed release.
- Validate the signed archive and its privacy manifests; unsigned build success
  cannot validate signing or guarantee App Store approval.

### Not blocking for this regression merge

- Existing lint debt and dependency deployment-target/script-phase warnings.
- No backend, database, API structure, GPS algorithm, or auth-provider UI changes.
- No embedded private key/server secret identified in the inspected frontend auth,
  API and subscription source. Public RevenueCat SDK keys are expected client data;
  this scoped review is not a guarantee that every historical artifact is secret-free.
- Native location descriptions, background mode, Apple entitlement and theme/tablet
  settings are present. Their existence is not a substitute for device tests.

### Future improvement

- Enable the root current-user query only after authenticated hydration, and
  explicitly model account ownership of all cached data in a separate change.
- Sanitize raw frontend auth errors and RevenueCat account-ID logs.
- Add permanent native end-to-end startup/navigation and account-switch tests.
- Consolidate redundant guards only with a separately tested navigation change.

Sources checked 2026-09-11:
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/news/upcoming-requirements/
