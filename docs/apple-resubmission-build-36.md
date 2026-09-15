# Apple resubmission audit — version 1.0, build 36

Audited September 15, 2026 on branch `android_setup`. No Git commits, branch changes, merges, pushes, or GitHub actions. Existing Android work was preserved. This is a targeted source/configuration audit, not a guarantee of App Review approval or a substitute for device testing.

## Rejection and correction

The previous generic onboarding location screen displayed **Enable location** and **Not now** before requesting native foreground location. Notifications used the same pattern. The trip recorder’s background-location explanation also allowed Cancel before its native request.

New iOS-specific onboarding screens use the existing responsive Deduckly layout. The initial explanation has **Continue** only; its route disables back gestures. Continue reads OS status and requests native permission only when it is undetermined and requestable. The OS dialog owns Allow/Don’t Allow. Denial does not advance or prompt again: it changes to a separate informational state with Settings and Continue without access. Already-denied/restricted permissions enter that informational state immediately. Returning from Settings refreshes the actual OS result. Loading/registration errors remain recoverable. Android onboarding is unchanged.

The iOS trip background explanation similarly offers only Continue, immediately followed by Expo’s native request. An existing denial offers Settings instead; foreground-only recording remains available when foreground access is granted. GPS sampling, distance calculations, native location task, active-trip journal, and Siri implementation were not rewritten.

## Complete location flow

- `app/onboarding.tsx` chooses location, notifications, goals, then welcome. Expo/Metro resolves the new `.ios.tsx` location/notification variants.
- `screens/location-screen.ios.tsx` → `components/ios-permission-screen.tsx` → `Location.getForegroundPermissionsAsync` → user taps Continue → `requestForegroundPermissionsAsync` if undetermined.
- Denied/restricted → informational Settings action via the shared screen’s `Linking.openSettings`, or continue setup without tracking. Settings return triggers `AppState` refresh.
- Start Trip/tracking context → `background-tracking.ts:startRecording`: verify foreground; request only if undetermined on iOS. Denial blocks trip recording and offers Cancel/Settings. If foreground is granted, inspect background status. Initial background explanation → Continue → `requestBackgroundPermissionsAsync`; prior denial → Settings information, no repeated request.
- `attachRecorders` starts Expo TaskManager background updates when authorized, otherwise foreground watch. `resumeRecording` checks current permission without requesting. Ending/canceling a trip stops recording.
- `location.service.ts:requestLocationPermission` is an unused helper retained for compatibility and now applies the same iOS denial guard. Its sampling helper is unchanged.
- iOS can suppress an Always upgrade after Allow Once, or defer an upgrade dialog. The app cannot force iOS to display a prompt or promise uninterrupted recording after termination. Actual OS results determine foreground/background mode.

## Protected-resource inventory

| Resource | Need and request point | Denial and configuration |
|---|---|---|
| Foreground location | GPS mileage for a user-started trip; onboarding or Start Trip | Undetermined → native request; denied → Settings/cancel, no loop. `NSLocationWhenInUseUsageDescription` describes trip tracking. |
| Background location | Continue an active trip while locked/backgrounded; Start Trip after foreground access | Neutral explanation → native request; denied → Settings and honest foreground-only limitation. Always/AlwaysAndWhenInUse strings describe active-trip recording. `UIBackgroundModes` contains location. |
| Notifications | Optional trip/goal reminders; onboarding or enabling in Preferences | New neutral iOS onboarding; denied → Settings/recovery. Registration/sync respects OS permission and preferences. Sync does not prompt. Existing push scheduling is unchanged. `aps-environment` capability retained. |
| Camera | User taps Take Photo for an expense receipt | Direct native request only if undetermined on iOS; denied → Settings or existing photo. Purpose string describes receipts. No video/audio capture. |
| Photos | User chooses a receipt image | System image picker, images only. Removed the broad library permission request. Existing photo purpose string retained for library integration; no full-library access is needed by this flow. |
| Microphone | No app request or recording feature found | Removed unused generic purpose declaration. Siri is managed by the system and does not require direct microphone access by Deduckly. |
| Face ID/biometrics | SecureStore is used without `requireAuthentication`; no biometric flow found | Removed unused generic Face ID purpose declaration. Token storage remains unchanged. |
| Siri/App Intents | Existing user-invoked trip shortcuts | Native Siri/AppIntents code, entitlements, app group and confirmation behavior preserved. No new resource requests. |
| Contacts, ATT, Bluetooth, Motion/Fitness, Calendar | No app API request or feature found in app/native source | No declarations added. No advertising/tracking consent workaround. |
| Local network | Production API uses HTTPS `api.karlsonworks.com` | No app LAN discovery/request found. Existing transport config disallows arbitrary loads; local-network transport allowance is not a permission grant. |

Relevant configuration: `app.json` Expo Location plugin, native Info.plist, native entitlements, and `Supporting/Expo.plist`. No CocoaPods/dependency changes required: Podfile.lock matches installed Manifest.lock. Future prebuild regeneration should be reviewed because default plugins can restore unused purpose declarations.

## Targeted review audit

- **Startup/completeness:** AuthProvider restores once; AuthGate redirects after loading. Session invalidation only occurs for a nonempty matching token. Guest request failures cannot repeatedly redirect Login/Register. Auth stack is not guarded by a second guest redirect. Session recovery checks pass. Real fresh-install device navigation remains to be exercised.
- **Hardware/design:** Existing scrollable onboarding, tablet columns, phone sizes, themes, and language integration retained. No redesign. Existing render checks cover small phones/tablets; no physical iPad/iPhone walkthrough was completed by these tests.
- **Subscriptions:** iOS RevenueCat public key remains separate from Android. Purchase completion checks active `Deduckly Pro`; Restore Purchases, Terms and Privacy links are in the paywall. No app code depending on promoted StoreKit purchases was found. Offering/purchase server availability and sandbox renewals require manual verification.
- **Apple login:** Native Apple sign-in/nonce/challenge/backend validation and revocation-on-account-deletion remain intact. Removed backend logging of Apple's full token response and frontend logging of purchase/account identifiers. The backend edit must be deployed separately; an Xcode upload cannot deploy it.
- **Privacy/legal:** In-app terms/privacy pages and account deletion entry points exist. Backend account deletion revokes Apple then deletes the user with relationship cascades for trips, expenses, income, OAuth, sessions and subscriptions. External policy URL availability could not be confirmed by the browsing tool. App Store privacy labels must reflect actual collection, not be inferred from an empty application `NSPrivacyCollectedDataTypes` list.
- **Background execution:** Only location background mode; user-started recording, permission status checks, persisted active trip. No claim that iOS can be prevented from terminating the process.
- **Production configuration:** HTTPS production API host; iOS RevenueCat key present (values not logged). Release scheme embeds current JS. Existing Expo Updates runtime `1.0.1` remains enabled: verify no older compatible OTA update is published to the release channel.

## Unresolved findings — address before public release

1. **Google OAuth security / 2FA:** `backend/app/api/v1/endpoints/auth.py:google_callback` issues full access/refresh tokens without the password-login 2FA branch. Tokens are passed in a custom-scheme URL; the inspected authorization flow does not show state/PKCE binding. This needs coordinated backend/client changes and end-to-end security testing, not a speculative last-minute navigation rewrite. No bypass was added by this release.
2. **Account-switch cache isolation:** QueryClient is a singleton; `current-user` and other queries are not account-keyed, and sign-out does not visibly clear the query cache. Test account A → logout → account B for stale data and fix the lifecycle coherently. The existing persistent offline cache tests do not prove React Query isolation.
3. **Receipt retention on account deletion:** Database cascades remove expense rows, but the inspected account-delete endpoint does not delete corresponding S3 receipt objects. Unlike the single-receipt path, it does not call storage deletion. Verify storage lifecycle/deletion jobs; otherwise implement reliable account-data cleanup before claiming complete deletion. No production deletion was attempted.
4. **Lint debt:** 112 errors and 33 warnings remain, matching the pre-change lint totals; no broad lint cleanup was performed. Some are hook/style/unused-code issues and require separate triage. A successful archive is not proof these are all harmless.

## Validation

- TypeScript `npx tsc --noEmit`: PASS.
- Expo Doctor: 18/18 PASS.
- All nine `scripts/verify-*.cjs` suites: PASS (iOS permission state machine; Android boundaries; session recovery 13; offline access 10 plus responsive renders; trip recovery 18; language/onboarding; reports; theme; animation boundaries).
- Native plist/entitlement syntax: PASS. Installed Pods lock equality: PASS. `git diff --check`: PASS.
- The Android guard was updated narrowly to allow only the authorized Info.plist metadata changes and build 9 → 36, retaining exact checks on other native files.
- ESLint: FAIL, 112 errors / 33 warnings. Full log: `/tmp/deduckly-apple-resubmission/lint-final.log`.
- These JS suites mock native APIs. They do not prove real Apple permission dialogs, background GPS, Apple/Google sign-in, 2FA, purchases, or account deletion on a device.

## Manual App Store Connect actions

Choose ONE for the rejected promoted-IAP image:

A. If not promoting Deduckly Pro now, remove its promotional/App Store image and remove it from promotion if necessary.

B. If promoting it, replace that image with a unique **1024×1024** Deduckly Pro promotional image. Do not reuse or alter the normal app icon.

Then verify public privacy/support links, App Privacy disclosures (including location, account information, receipt/financial data and purchases), subscription metadata/prices, standard EULA link in the description or an appropriate custom EULA, screenshots, and a working reviewer account. Select the newly processed build only after the remaining release concerns are resolved. No automatic review submission is authorized.

## Suggested App Review Notes

This build updates the iOS location permission flow. The initial explanation now uses a single neutral “Continue” button, which invokes the native iOS permission request. It has no “Not now” or dismiss option. Users make their permission choice in the native dialog. If access was previously denied, Deduckly shows a separate Settings/help state without repeatedly requesting access. Mileage tracking requires location; background access is used only for trips the user starts. The same neutral approach is applied to notification onboarding.

Add a statement about the promoted subscription image only after you actually remove or replace it in App Store Connect. Include current reviewer credentials in App Store Connect’s dedicated fields, not in source control or this file.

Reference: [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

## Xcode release outcome

- Product → Clean Build Folder: **SUCCEEDED** (September 15, 2026, 8:26 AM local).
- Product → Archive: **SUCCEEDED**. Organizer archive created September 15, 2026, 8:38 AM local.
- Archive: `/Users/alexjames/Library/Developer/Xcode/Archives/2026-09-15/frontend 9-15-26, 8.38 AM.xcarchive`.
- Verified archived metadata: version **1.0**, build **36**, bundle **com.karlsonworks.deduckly**, team **G64MM7TYUG**, arm64, Release scheme, SDK iphoneos26.5. Existing minimum OS is iOS 26.0; this release did not raise it.
- Archived JavaScript includes the new iOS permission-state copy and production API host. SHA-256: `3296f844f4cf804fbce6cd83fc74eeedbe3017c77a75909009c71700b15ae212`.
- Unused microphone/Face ID declarations are absent from the archived Info.plist.
- Standalone `codesign --verify --deep --strict` returned `CSSMERR_TP_NOT_TRUSTED` for the development-signed archive. Distribution signing/validation has not yet completed; do not treat this as an App Store-validated binary.
- Organizer → Validate App → recommended validation: **BLOCKED**, “App Store Connect access for ‘Alex Carl’ is required. Ensure that your Apple Account usernames and passwords are correct in Accounts settings.”
- Manage Accounts shows **no signed-in Apple Account**. Xcode Settings → Apple Accounts is open for the user to sign in.
- **Upload has not happened. App Review submission has not happened.** Once account access is restored, validate and upload this archive through Organizer; stop before review submission.

## Files changed specifically for this Apple task

Pre-existing Android changes are excluded from this list. Some listed files already had Android edits; those edits were retained.

- `frontend/src/features/onboarding/components/ios-permission-screen.tsx` — new iOS consent/recovery state handling.
- `frontend/src/features/onboarding/screens/location-screen.ios.tsx` — neutral, non-skippable initial iOS explanation.
- `frontend/src/features/onboarding/screens/notifications-screen.ios.tsx` — same iOS correction for notifications.
- `frontend/src/features/tracking/services/background-tracking.ts` — guarded foreground/background requests and Settings recovery.
- `frontend/src/features/tracking/services/location.service.ts` — denial-safe iOS permission helper.
- `frontend/src/features/expenses/components/ExpenseForm.tsx` — camera denial recovery and system photo picker without broad library prompt.
- `frontend/src/services/notifications.ts` — Settings recovery for denied iOS notification access.
- `frontend/src/i18n/es.ts` — Spanish permission/recovery messages.
- `frontend/src/features/subscriptions/context/subscription.context.tsx` and `services/revenuecat.service.ts` — remove account-identifier debug logging; purchase SDK behavior retained.
- `backend/app/services/apple_auth_service.py` — remove full Apple token-response logging; not deployed by this task.
- `frontend/ios/frontend/Info.plist` — remove unused permission strings and derive version from marketing version.
- `frontend/ios/frontend.xcodeproj/project.pbxproj` — build 36, both configurations.
- `frontend/scripts/verify-ios-permissions.cjs` — permission state/denial/regression checks.
- `frontend/scripts/verify-trip-recovery.cjs` — mock Settings linking for the updated denial behavior.
- `frontend/scripts/verify-android.cjs` — narrow native-file guard for this authorized iOS release.
- This audit document.
