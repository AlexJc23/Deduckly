# Xcode warning audit — 7 September 2026

## Scope and evidence

Inspected the complete warning streams, native app sources/settings, dependency source at significant diagnostics, compiled icon metadata, and the latest existing archive. Warning totals depend on build configuration and repeated header diagnostics; they are not counts of independent bugs.

| Evidence | Warning occurrences | Distinct message texts |
| --- | ---: | ---: |
| `.expo/xcodebuild.log`, 7 September, Debug device build, succeeded | 1,290 | 219 |
| Xcode build log `387C014A-44C7-4ECE-9E50-5BC15ECD2447`, 6 September, Release simulator, zero recorded errors | 4,771 | 587 |

Xcode's own LogStoreManifest reports 4,771 warnings for that older build. Neither available log contains exactly 2,000. The older log includes 2,301 repeated React prebuilt umbrella-header warnings, explaining much of the difference. Its 77 Hermes bundle warnings involve runtime globals and bundled framework/web paths; examples were traced to Expo Router, React Native, and Reanimated sources. They do not establish that those paths execute on iOS.

## 1. App-owned warnings

| Root cause | Latest Debug | Older Xcode | Assessment/action |
| --- | ---: | ---: | --- |
| Unassigned icon-catalog files | 60 | 60 | Twelve icon sets, each reported five times. Extra unreferenced PNGs, not missing referenced files. Left intact; deleting/moving artwork solely to lower the count is unnecessary. |
| `UIRequiresFullScreen = false` deprecated | 1 | 1 | Does not opt out of multitasking. No warning-only plist change. |
| Duplicate `-lc++` | 1 | 2 | Redundant app/inherited linker input; linker explicitly ignores duplicate. No suppression or linker changes. |
| **Total app-owned configuration/assets** | **62** | **63** | No custom Swift/Objective-C implementation warning found in SiriBridge, AppIntents, or AppIconManager. |

AppDelegate has another **4 / 8** diagnostics for `UIWindow(frame:)`, `UIScreen.main`, and `OpenURLOptionsKey`. These are in an app-owned file but come from Expo's bootstrap/linking pattern. Classified separately as framework integration, not a defect in custom business logic. Do not replace individual APIs without migrating the complete scene lifecycle and preserving Expo linking/event delivery.

## 2. Expo / React Native and transitive dependencies

**1,224 / 4,700** remaining occurrences, excluding the Expo-template diagnostics above. Includes CocoaPods, React Native prebuilt/generated headers, Expo modules, RN Screens/SVG/Gesture Handler/Reanimated, image codecs, empty object files, Hermes globals, and build scripts.

The latest Debug log includes 700 nullability and 187 deprecation message occurrences (the latter includes the app/template deprecations). Other frequent diagnostics are documentation mismatches, missing super-call suggestions, unused helpers, enum conversions, old pod deployment targets, and scripts without declared outputs. Header repetitions dominate the count. No third-party source, dependency versions, warning flags, pod deployment targets, or build scripts were changed.

## 3. Runtime and submission significance (overlaps ownership categories)

- **Image codecs:** libwebp reports five possibly uninitialized-variable warnings; libdav1d reports incompatible pointer types. Checked libwebp's guards: sums are consumed under the corresponding initialization conditions, and the offset is consumed after a positive match. The warnings alone do not demonstrate an uninitialized read. Decoder pointer warnings still merit upstream maintenance and image-loading regression coverage; no codec was patched.
- **ExpoModulesCore:** `DynamicDataType.swift:14` tests an `AnyDynamicType` against `Data.Type`, which the compiler says always fails. This is a real suspicious dependency equality path; no impact on a Deduckly flow was demonstrated. Other dependency missing-method/nullability diagnostics are not proof of a reachable crash.
- **Gesture Handler:** `RNPanHandler.m:110` has a void method sharing the name of a CGFloat property getter, producing a conflicting-return-type warning. Long-press/pan behavior should be covered on device. Left upstream code untouched.
- **Swift compatibility:** shadowed generic parameters become errors under Swift 6 language mode. The app currently uses Swift 5 mode; do not force Swift 6 across pods as warning cleanup.
- **UIKit lifecycle:** the current app uses the legacy Expo AppDelegate setup, with no scene manifest. Apple says apps built with the iOS 27 SDK must adopt UIScene or fail to launch. This is a real next-SDK migration requirement, not a reason to rewrite bootstrap during this warning audit. Current verification uses the iOS 26.5 SDK.
- **Icons:** the latest existing archive includes the primary icon and all 11 configured alternate icons for iPhone/iPad. All compiled icon image renditions inspected are opaque, despite some source PNGs containing alpha channels. No missing-icon or nonopaque compiled-icon blocker was established.
- **Minimum OS:** the app target and existing archive require iOS 26.0, while pods generally target 15.1. This limits distribution to iOS 26+; it is not an SDK submission failure. Left the product support decision unchanged.
- **Build number — fixed:** source Info.plist hardcoded `CFBundleVersion` to `1`, overriding Xcode's `CURRENT_PROJECT_VERSION = 9`. The 6 September device archive actually contains build `1`. Changed only this value to `$(CURRENT_PROJECT_VERSION)` so the configured build number reaches the binary. This does not choose a new number or guarantee 9 has not already been uploaded.

## Verification and release assessment

A fresh unsigned arm64 Release build completed with **BUILD SUCCEEDED**, zero error diagnostics, and **2,220 warning occurrences / 567 distinct message texts**. Breakdown: 60 icon-catalog warnings, one full-screen-key warning, one duplicate-library warning, four Expo-template warnings, and 2,154 dependency/toolchain warnings. These are overlapping repeats of the categories above, not 2,220 new defects. Full local log: `/tmp/deduckly-warning-audit-release.log`.

`plutil -lint` and `git diff --check` passed. Both target configurations retain `CURRENT_PROJECT_VERSION = 9`; source `CFBundleVersion` now expands that setting. The completed build's DerivedData product directory was no longer present at final readback, so the processed binary build number could not be independently inspected. Confirm it in the next signed archive. Existing archives were not modified.

Separately, during this audit the user reported missing dark styling in Offer Analyzer. Its native KeyboardAvoidingView had a fixed white background, bypassing the themed component wrappers. Added the active theme background to that screen and extended the theme rendering checks. This frontend fix is separate from the warning-count assessment; no offer calculation logic changed.

The warning count itself is not a release blocker. This is a warning audit, not an App Store approval or runtime safety certification. Before shipping, validate a fresh signed archive in Organizer/App Store Connect and run native smoke tests for launch, auth/deep links, daily/monthly goal cards, gestures, image loading, Siri/background tracking, notifications, and purchase/restore. In particular, an unsigned build cannot verify signing, provisioning, server-side App Store metadata, or real-device behavior. No upload or distribution was performed.

## Primary references

- [Apple: scene lifecycle migration and the iOS 27 SDK requirement](https://developer.apple.com/documentation/technotes/tn3187-migrating-to-the-uikit-scene-based-life-cycle)
- [Apple: current App Store submission SDK requirements](https://developer.apple.com/app-store/submitting/)
- [Apple: alternate app icon configuration](https://developer.apple.com/documentation/xcode/configuring-your-app-to-use-alternate-app-icons)
- [Apple: build and version number configuration](https://developer.apple.com/library/archive/qa/qa1827/_index.html)
