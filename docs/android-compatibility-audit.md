# Android compatibility audit — 12 September 2026

## Current status

Branch: `android_setup`, starting commit `b09b933`. No upstream is configured. All changes remain uncommitted. No branch switches, merges or pushes were performed.

Android development build and installation succeed on the existing Pixel_8 emulator. This is not a Play release certification. iOS Build 35 native files are unchanged; non-Android Expo configuration matches the starting commit. Production JavaScript source maps select original iOS services and Android variants on their respective platforms.

## Evidence and remaining verification

| Area | Evidence / status |
|---|---|
| Startup, fonts, providers, session | Existing Test account restored; Dashboard and Settings rendered. Automated session/offline tests pass. No new auth architecture changes. |
| Router | Moved unchanged icon data out of `app/`; imports updated. Production Android export succeeds. |
| Login/register/logout/refresh | Existing session recovery checks pass, including single invalidation, logout, refresh and concurrent account changes. Fresh interactive registration/login/logout not certified by this audit. |
| Google / Apple / 2FA | Google uses backend browser OAuth and `deduckly://oauth/callback`; Android declares that scheme. Apple remains iOS-only. Live Google credentials and 2FA enrollment/disable still require dedicated end-to-end testing. No security behavior weakened. |
| Onboarding/language | Existing migration, ownership, save/skip/error and phone/tablet/theme/language tests pass. Preferences displayed in emulator. Enabled/default platform preferences described in the request are not implemented as a separate persisted feature in this checkout; no new data model invented. |
| Dashboard/activity/reports | Emulator rendered account dashboard, existing trips and monthly report data. Report calculation/layout tests pass. Premium periods/exports remain unavailable for live testing until Android billing/test entitlement setup. |
| Trips/location | Permission disclosure, Android background settings and clean failed-start UI observed. Positive native trip start was blocked by the emulator location-accuracy prompt being declined. Eighteen mocked recovery checks pass in both default and Android modes. No claim of measured mileage or full native trip lifecycle. |
| Expenses/images | Form and single tap-triggered native date dialog verified. Android uses system photo picker without broad media permission; camera remains contextual. Live camera capture/receipt upload and CRUD require test-device follow-up. No existing records edited/deleted. |
| Income | Android waits for successful mutation, reports failure without leaving, validates positive finite amounts, normalizes decimal comma and retains edited date. Functional test verifies submission/date/iOS boundary. Live CRUD not certified. |
| Offer Analyzer | Android finite positive payout/distance and nonnegative time checks; decimal input normalization. Existing theme/layout tests pass. Live premium configuration remains blocked. |
| Exports | Functional test verifies bytes, cache path and MIME passed to Expo sharing. Actual receiving app/share-sheet completion still needs a device test. No storage permission needed. |
| Settings/modals | Settings/Preferences rendered, Apple app-icon UI hidden on Android. Delete-account modal now handles Android Back. No destructive account actions performed. |
| Notifications | Channel-before-permission and opt-out behavior tested with mocks. Server remains responsible for schedules. Actual FCM delivery requires external setup. |
| Siri | Android UI hidden; absent native bridge is already safe. No Siri/native Apple modifications. |
| Networking/offline | Production API uses configured HTTPS; public endpoint returned 200. Offline/session/journal tests pass. No development IP added to production source. |
| UI | Date dialog and back/scroll behavior observed on Pixel_8. Existing phone/tablet render tests pass. Physical Samsung, small Android phone, tablet, keyboard and system edge-to-edge interactions still need acceptance testing. |

## Changes

- `app.json`: Android tracking/notification permissions; block overlay, microphone and broad media/storage permissions. All other Expo configuration preserved.
- `scripts/sync-android-permissions.cjs`: reproducibly updates permissions in the existing generated Android manifest without running iOS prebuild. `android/` is ignored; this script and app configuration retain the source of truth.
- `src/constants/platform-icons.ts`: exact move from `app/constants/platform-icons.ts`; Dashboard import updated.
- `src/components/ui/DateField.android.tsx` and default `DateField.tsx`: Android opens one native dialog on tap; iOS reexports the same original picker. Four expense/report/activity/trip date consumers use this boundary.
- Android subscription provider/service and `example.env`: Android key only, no fallback to iOS credentials, no SDK initialization while unconfigured; navigation children stay mounted. Original iOS files unchanged.
- Android notifications service: channel, explicit Expo project ID, contextual permission request, silent sync and opt-out. No duplicate scheduling added.
- Dashboard, Settings and Android app-icons route: hide Apple-only controls safely.
- Paywall: Android unavailable state and Google Play wording; original iOS wording remains.
- Expense/Income/Offer forms and income screens: Android input and save behavior described above. Delete-account modal: Android back handler.
- Verification scripts: platform boundaries, form/export behavior, Android foreground-service arguments; native integrations are mocked.

## Android permission audit

Actual release manifest targets SDK 36, minimum SDK 24. `LocationTaskService` declares `foregroundServiceType="location"`.

| Permission | Why / feature | Type and versions | Denial and request timing | Play implications |
|---|---|---|---|---|
| INTERNET | API, OAuth, upload, push, sync | Normal manifest; all supported versions | No prompt. Offline journals retain trips; server operations need connection. | Data Safety must describe actual collection/transmission. |
| ACCESS_COARSE_LOCATION | Android location grant, approximate fallback | Runtime; API 23+, all supported; approximate choice API 31+ | Ask when enabling location/start trip. Approximate location cannot be treated as reliable mileage. | Location disclosure and data declaration. |
| ACCESS_FINE_LOCATION | Precise GPS mileage | Runtime API 23+ | Denial prevents accurate tracking; show location guidance. Request in context, not automatic on launch. | Explain core mileage use and precise data collection. |
| ACCESS_BACKGROUND_LOCATION | Active trip recording outside visible app | Runtime API 29+; settings flow API 30+ | After foreground access and explanatory disclosure. Denial uses explicit foreground-only fallback; cannot promise background miles. | Background-location declaration, prominent disclosure, privacy policy and demonstration video. |
| FOREGROUND_SERVICE | Ongoing trip service | Normal manifest API 28+ | No separate prompt; start from user-visible trip action. Missing declaration breaks service startup. | Declare foreground-service use. |
| FOREGROUND_SERVICE_LOCATION | Location service type | Normal manifest API 34+ | No separate prompt; location grant still needed. | Location FGS declaration/use case. |
| POST_NOTIFICATIONS | Reminder alerts and visible service notification | Runtime API 33+ | Optional onboarding enable/settings; sync never prompts. Denied reminder alerts are unavailable. OS can still run FGS with task-manager notice when notifications are denied. | Respect opt-out; disclose reminder purpose. |
| CAMERA | Take receipt photo | Runtime API 23+ | Only when tapping camera; denied camera leaves photo picker option. | Describe receipt collection; no unrelated camera request. |
| VIBRATE | Notification/haptic feedback | Normal, all supported | No prompt; device settings can suppress vibration. | No special location-style declaration. |
| ACCESS_NETWORK_STATE / ACCESS_WIFI_STATE | Dependency connectivity state | Normal, all supported | No prompt; not authorization to scan/location-track Wi-Fi. | Actual transmitted data governs Data Safety. |
| RECEIVE_BOOT_COMPLETED / WAKE_LOCK | Notification/task SDK support | Normal, all supported | No prompt. These do not guarantee automatic trip restart after reboot or force-stop. | Describe actual background behavior; no fabricated always-on guarantee. |

Library-declared permissions retained in the release merge: `USE_BIOMETRIC`, `USE_FINGERPRINT` (SecureStore support, not a newly implemented biometric flow), `com.android.vending.BILLING` (future Play purchases), `com.google.android.c2dm.permission.RECEIVE` (FCM), `com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE`, and the app's signature-level `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. They do not add runtime dialogs in the audited flows. Billing still requires Play setup; SDK presence alone does not enable purchases.

Launcher badge declarations also come from dependencies: Samsung READ/WRITE badge; HTC READ_SETTINGS/UPDATE_SHORTCUT; Sony BROADCAST_BADGE/PROVIDER_INSERT_BADGE; AndDoes UPDATE_COUNT; Majeur UPDATE_BADGE; Huawei CHANGE_BADGE/READ_SETTINGS/WRITE_SETTINGS; READ_APP_BADGE; Oppo READ_SETTINGS/WRITE_SETTINGS; Everything BADGE_COUNT_READ/WRITE. These are vendor-specific SDK support, not new user-facing permission requests. No dependency source was edited to suppress them.

Blocked: SYSTEM_ALERT_WINDOW, RECORD_AUDIO, READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, READ_MEDIA_IMAGES, READ_MEDIA_VIDEO. Receipt selection uses the system picker; exports use private cache + share grants. No broad storage, microphone or overlay access is needed.

Sources: [Android background location](https://developer.android.com/develop/sensors-and-location/location/background), [foreground service launch restrictions](https://developer.android.com/develop/background-work/services/fgs/launch), [Play background-location requirements](https://support.google.com/googleplay/android-developer/answer/9799150?hl=en), [Expo image picker](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/), [Expo notifications](https://docs.expo.dev/versions/v54.0.0/sdk/notifications/). Confirm current Console declarations before submission, including any newly applicable target-version requirements.

## Tracking limitations and physical acceptance tests

The GPS algorithm is unchanged. Android already supplies an ongoing service notification and `killServiceOnDestroy: false`. This is not immunity from OS termination. The persisted owner-scoped journal can recover recorded data on reopening; missing samples are not invented. Force-stop, OEM battery restrictions, unavailable GPS and internet outages are distinct conditions.

Before Play release, test a known measured route on a physical Android phone, including Samsung: screen locked, app backgrounded, prolonged tracking, poor GPS, no internet, reconnect/upload, permission revocation, battery optimization, process death and reopening. Confirm original start/platform/miles survive and final sync creates one trip. Test service/reminder notifications separately, including notification denial. Confirm GPS accuracy without network service; network-assisted fix acquisition can differ from offline GPS reception. Test camera/picker/upload, sharing, auth/2FA and real Play purchases/restore on dedicated accounts.

## External setup and release gates

- RevenueCat Android public SDK key; Google Play app/products/base plans and RevenueCat entitlement mapping. No credentials invented and iOS key untouched.
- Firebase Android configuration (`google-services.json`/Expo Android configuration) and EAS FCM v1 credentials, then Android rebuild and delivery test.
- Verify existing backend Google OAuth permits the Android callback. Current flow is browser/backend OAuth, so native Android OAuth SHA/client requirements should not be assumed unless migrating to a native SDK.
- Play Console: background-location/FGS declarations, Data Safety, privacy policy, account-deletion URL/flow, reviewer access, subscription disclosures. Existing Apple-specific legal prose needs legal/product review for Android before release.
- Existing cross-platform security/release findings in `startup-navigation-regression.md` are not fixed or waived by this Android audit.
- Lint remains failing at 112 errors/33 warnings, matching the prior baseline. Do not label the release fully verified until failures are triaged and manual acceptance is complete.

## Commands and evidence

Run from `frontend/`, using the installed Node runtime:

```sh
npx tsc --noEmit
for script in scripts/verify*.cjs; do node "$script" || break; done
DEDUCKLY_TEST_PLATFORM=android node scripts/verify-trip-recovery.cjs
npm run lint
node scripts/sync-android-permissions.cjs
npx expo run:android --no-bundler
./android/gradlew -p android --no-daemon :app:processReleaseMainManifest
```

TypeScript checks types; verification scripts exercise current behavior with documented mocks; lint reports style/static issues; permission sync affects only generated Android permissions; Expo builds/installs using existing Metro; the last command inspects merged release permissions, not a signed store archive. In this shell, a stale Gradle daemon could not locate Node; setting the existing Node PATH and `GRADLE_OPTS=-Dorg.gradle.daemon=false` resolved the build environment failure without project configuration changes.

Production JS exports succeeded for Android and iOS. Eleven Android checks pass; all existing verification scripts and Android-mode tracking checks pass. Lint fails as above. No signed Play AAB, Play upload, or native iOS build was performed.
