# Account launch recovery

Branch: `fix/account-launch-recovery`
Checkout: `/tmp/deduckly-account-launch`

Apple reported that build 1.0 (31) could not proceed past the account-loading error on an iPad Pro 11-inch (M4), iPadOS 27.0. The screenshot matches `OnboardingGate`, which uses the same generic error for a failed `/api/v1/users/me` request and a failed local onboarding-state read. The screenshot alone cannot identify which failed.

Confirmed frontend problems repaired:

- Token invalidation did not notify AuthProvider, leaving the UI marked signed in after its credentials were removed.
- An account request returning 401 again after refresh did not invalidate the unusable session.
- Token refresh had no timeout.
- Temporary refresh network failures removed credentials even though the server had not rejected them.
- Auth restoration did not handle a storage read rejection or ignore a stale result after a session change.

The fix notifies the auth UI when credentials are invalidated, returns to sign-in after navigation is mounted, bounds refresh at 10 seconds, preserves sessions on network/server failures, and serializes credential changes so a late old-session failure cannot erase a new login. Backend and API contracts are unchanged.

Validation: nine mocked session-recovery checks pass (`node frontend/scripts/verify-session-recovery.cjs`). TypeScript and a production iOS JavaScript export pass. Targeted lint has no errors; the pre-existing Axios import warning remains. The production server's account endpoint returned 401 without credentials during a read-only availability check. That confirms reachability at the time of the check, not successful authentication, response serialization, or availability during Apple's review.

Still required before claiming the rejection is resolved:

1. Confirm the exact API URL embedded in submitted build 31; the local frontend env points at `api.karlsonworks.com`, but that does not establish the submitted build's configuration.
2. Test the review account in TestFlight, including relaunch with an expired/revoked session and a fresh installation. Verify valid credentials reach onboarding/dashboard.
3. Inspect the production `/api/v1/users/me` and refresh logs around the review attempt for 401/403/500, without logging tokens or passwords.
4. Test on a supported iPad and submit a replacement build only after reproducing and verifying the reported path.

## Offline entry added

This branch now includes the pending background-GPS recovery changes as well as session recovery and offline trip entry. The original Desktop checkout was not modified by this integration.

Returning users with completed, account-scoped onboarding can open a dedicated offline trip screen using their existing SecureStore session and saved onboarding state (including legacy completed onboarding). No duplicate personal-profile cache is created. An expired access token can still identify a previously signed-in user locally while offline; API authorization and token refresh still apply when connecting to the server.

Offline entry supports starting, continuing, ending, and locally saving GPS trips. Reports and account updates require internet and are labeled accordingly. This is not a complete offline copy of every report or account setting. A new account/device or unfinished onboarding must first complete setup online. Cleared sessions and 2FA temporary tokens cannot unlock offline entry.

Network changes and app focus trigger rechecks. Explicit retry probes the API even if the device’s reachability indication is stale. Request-generation checks prevent an older result from replacing newer connectivity state. Timeouts and server outages can use the offline trip screen; explicit 401/403/404 responses and disabled/mismatched accounts invalidate access instead of falling back offline. Auth invalidation pauses background recording while preserving saved mileage.

Run from frontend after installing dependencies:

```sh
node scripts/verify-session-recovery.cjs
node scripts/verify-trip-recovery.cjs
node scripts/verify-offline-access.cjs
npx tsc --noEmit --incremental false
```

Current automated results: 9 session checks, 18 GPS/recovery checks, and 10 offline-access checks passed. TypeScript and the combined production iOS JavaScript export passed (`/tmp/deduckly-offline-export.log`). Existing language/onboarding regression checks also passed. Offline trip UI rendered successfully in 24 combinations of English/Spanish, light/dark, 320/390/1024-point widths, and active/new trip states. These are mocked device/network tests and server-rendered layouts, not physical-device validation.

Before resubmission, install a new signed native build including Expo TaskManager (runtime 1.0.1). Complete sign-in/onboarding online, then force-close with Wi-Fi and cellular data disabled. Relaunch, start/continue a trip, end it offline, reconnect, and verify exactly one saved trip. Repeat on a small iPhone and a supported iPad. Test an expired token while offline and a deliberately revoked session online. Do not treat the existing unsigned GPS build or JavaScript export as proof of real-device offline behavior.

No merge, commit, signed build, upload, or App Store submission has been performed here.
