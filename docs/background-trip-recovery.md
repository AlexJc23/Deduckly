# Background trip recording and recovery

Implemented on `fix/background-trip-recovery`. No backend, database, or API payload changes.

## Behavior

- `index.js` defines `deduckly-active-trip-location-v1` before Expo Router starts. The Expo Location task can save GPS batches without mounting React.
- Start Trip requests foreground permission, explains background use, then requests background permission. With background access, a single native location task records the user-started trip. Automatic pausing is disabled during the trip and the iOS location indicator is visible.
- Without background permission, recording falls back to foreground updates with an explicit warning. Losing foreground access pauses recording while preserving the saved trip. Permissions are checked again on return to the app, without prompting during recovery.
- `trip-journal.ts` serializes location writes, restoration, completion, and cancellation. One AsyncStorage journal contains active trips and completed uploads. Completing a trip moves it to the upload queue in one write before clearing the active UI or stopping native tracking. Failed writes preserve the previously saved trip.
- Account IDs scope both active and pending trips. Clearing credentials stops recording; signing back into the same account can restore its trip. Upload requests verify the account again immediately before sending, including retries. Older pre-existing pending trips retain their existing queue/sync path.
- Coordinates, timestamps, excessive GPS uncertainty, and implausible speeds are filtered. Repeated/out-of-order timestamps do not add mileage. Known pauses and gaps longer than two minutes reanchor GPS instead of adding straight-line mileage across unobserved travel. The active screen explains interruptions.
- The existing start/end time, category, platform, mileage, optional income, and address fields are sent to the existing trip API. Failed address lookup does not block saving.
- Concurrent uploads share a single sync operation. If a previous response was lost, the next attempt checks existing trips before retrying the POST. The existing backend also has a unique constraint on user/start/end time. No new server idempotency mechanism was added.

## Native build requirements

`expo-task-manager ~14.0.9` was added and linked through CocoaPods. The existing iOS location background capability and permission descriptions are retained. Android background/foreground-service plugin flags were added for subsequent Android builds; Android has not been device-tested here.

A **new native iOS build is required**, including a new development client if using one. Expo Go and an OTA update to an older binary are insufficient. Runtime version is now `1.0.1` in app.json to separate this native dependency set from older releases. The existing local `ios/frontend/Supporting/Expo.plist` was also updated to runtime `1.0.1`; that generated file is ignored by this repository. If reusing another existing native directory, verify its runtime matches app.json before building. Do not use a clean prebuild that could remove custom Siri native files.

No build was signed, uploaded, or submitted to Apple as part of this change.

## Automated verification

Run from frontend:

```sh
node scripts/verify-trip-recovery.cjs
npx tsc --noEmit --incremental false
node scripts/verify-language-onboarding.cjs
node scripts/verify-theme.cjs
```

The recovery harness runs the actual TypeScript journal and recorder against mocked device/storage/network APIs. It covers restart persistence, concurrent starts, duplicate GPS batches, invalid fixes, GPS gaps, failed writes, atomic completion, late callbacks, cancellation, minimum-distance discard, account isolation, corrupt storage, task registration, permission fallback/revocation, sign-out, lost responses, short foreground pauses, native restart, and interrupted cleanup. These tests do not simulate iOS scheduling, memory pressure, or GPS accuracy on a drive.

### Results from this change

- 18 recovery checks passed.
- TypeScript passed with no errors.
- Existing language/onboarding and theme verification scripts passed.
- Targeted lint passed with no errors; the existing Axios import warning remains.
- Unsigned iOS Release build passed with Expo TaskManager linked. A final production iOS export also passed.
- `git diff --check` passed; backend files remain unchanged.

Build output: `/tmp/deduckly-tracking-release-final.log`. Production bundle verification: `/tmp/deduckly-tracking-export.log`. These artifacts are local verification only, not a signed installation or App Store submission.

## Required device verification before release

Use a new signed development or TestFlight build on a physical iPhone:

1. Start a trip, grant Always and Precise location, and drive a known route for 30–60 minutes with the screen locked and another app in use. Confirm mileage continues and compare against the known route.
2. Reopen repeatedly during the same trip. Confirm original start time, mileage continuity, and one trip after stopping.
3. Start another trip, record mileage, force-close, and reopen. Confirm the saved trip returns. Travel while force-closed must not be promised as recorded; verify interruption messaging when the GPS gap exceeds two minutes.
4. Record and end offline, then restore connectivity. Confirm one saved trip with its category/platform/income.
5. Deny Always, grant only foreground, and test locking/reopening. Confirm the foreground-only warning and no mileage credited across that known pause. Revoke all location access and confirm saved progress is retained.
6. Cancel a trip, reopen, and confirm it stays canceled. Sign out mid-trip, sign into another account, and confirm its trip/mileage cannot appear or upload there; sign back into the original account to recover.
7. Check the active-trip notice and controls on a small phone and iPad, in English/Spanish and light/dark modes.

## Limits

No iOS app can guarantee continuous tracking after force-quit or every OS termination. Recovery retains the last successfully written GPS batch, not readings iOS never delivered. Disk-full conditions can prevent newer points from being saved; the UI reports a recording problem. Physical-device/background accuracy and long-duration battery behavior remain to be verified before release.
