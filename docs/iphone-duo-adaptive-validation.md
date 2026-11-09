# iPhone adaptive foundation — validation record

## Scope

Branch: `feature/iphone-duo-adaptive-foundation`.
Starting revision: `4333d0b29e9ef27a9222558f5e1dfdac93db177a`.
The starting working tree was clean. No backend, tracking, authentication,
subscription service, offline queue, dependency, or version changes were made.

Installed tooling: Xcode 27.1 (27A9275), iOS/Simulator SDK 27.1, Expo 58.0.22,
React Native 0.88.1, Expo Router 58.0.29, React Navigation bottom tabs 7.21.0,
and safe-area-context 5.10.1. An official iPhone Duo simulator is installed.

## Navigation diagnosis and fix

On the official Duo simulator, rotating the open display across the existing
768pt sidebar/bottom-tab breakpoint left the active screen visible while its
navigation bar disappeared. The selected route and Activity Income filter
remained intact. Rebuilding only the bar did not resolve this.

Disabling `tabBarHideOnKeyboard` restored the bar. With no remount workaround,
subsequent rotations in both directions and folding retained accessible
navigation, the selected Activity route, and the Income filter. The fix uses the
navigator's default visible-bar behavior. Navigation now remains visible even
when an actual keyboard is open; this is an intentional behavior change.

The installed navigator's iOS keyboard visibility helper listens to
`keyboardWillShow` and `keyboardWillHide` and keeps the result in component state.
Stale keyboard visibility/animation across the display transition is the likely
event-level mechanism. The native keyboard-event sequence was not traced, so
this record does not assert a separate UIKit or Expo vulnerability/SDK defect.

Navigation also uses current safe insets, reserves at least a 44pt bottom row,
and avoids the sidebar in short windows. Standard expanded iPad-sized windows
retain the existing sidebar. No navigator, screen, or provider is keyed or
remounted based on geometry.

## Executed checks

- TypeScript: `tsc --noEmit --incremental false` — passed.
- Focused ESLint on changed navigation/helpers/scripts — passed, no errors.
- Paywall ESLint — zero errors, one pre-existing subscription-effect warning.
- Full ESLint — 736 errors and 59 warnings remain. Baseline was 745 errors and
  60 warnings. No assertions or lint rules were disabled to obtain this result.
- `git diff --check` — passed.
- Local Debug simulator `xcodebuild` — **BUILD SUCCEEDED**. Log:
  `/tmp/deduckly-duo-debug-build.log`.
- Built app plist: all four phone orientations, all four iPad orientations,
  and existing single-scene configuration verified. AppDelegate is unchanged.
- Local production iOS JavaScript export — passed. Output:
  `/tmp/deduckly-duo-release-export`; log:
  `/tmp/deduckly-duo-release-export.log`. This is not a signed Release archive.

The following scripts passed (logs use `/tmp/deduckly-duo-final-<name>.log`):

1. `verify-adaptive-layout.cjs`
2. `verify-trip-recovery.cjs`
3. `verify-session-recovery.cjs`
4. `verify-account-isolation.cjs`
5. `verify-shifts.cjs`
6. `verify-shift-lifecycle.cjs`
7. `verify-shift-detection.cjs`
8. `verify-ios-scenes.cjs`
9. `verify-debug-reload.cjs`
10. `verify-animation-boundaries.cjs`
11. `verify-theme.cjs`
12. `verify-language-onboarding.cjs`
13. `verify-offline-access.cjs`

Two broader UI harnesses failed before executing their assertions:

- `verify-product-ui.cjs`: Node cannot resolve Expo SecureStore's native module.
- `verify-ui-refinements.cjs`: Node cannot resolve Expo's `Expo.fx` module.

Both were rerun using application source from the starting revision and failed
with the same module-loading errors. They were not modified or counted as passes.

## Layout coverage and limits

The deterministic utility/navigation-option harness covers eight representative
window configurations: standard phone portrait/landscape, compact portrait/
landscape, expanded portrait/landscape, and iPad portrait/landscape. It also checks
changing dimensions/insets/font scale, asymmetric reserved edges, short windows,
large-text sidebar fit, and minimum tab touch-row height. These are layout tests,
not assertions that dimensions identify a physical device or folding pose.

Native visual verification using the running development app and updated
JavaScript covered the Duo open display in both orientations and a transition
to the closed portrait display. The selected route and Income filter survived.
No actual drive was started or stopped for this UI check. Active GPS behavior
during physical folding was not tested; synthetic tracking regressions passed.

The rebuilt native app installed and launched in the Duo simulator, with the new
orientation manifest verified. It returned to login after that local install.
The Mac then locked, blocking Device Hub input, so authenticated checks on the
rebuilt binary could not be completed. A later screenshot showed the login UI
in closed landscape behind Expo's developer-menu overlay; that is not treated as
a completed layout/accessibility check.

Standard iPhone and iPad navigation were exercised only by the reproducible
layout harnesses during this task, not verified visually on those simulators.
Partially open pose, full VoiceOver/Dynamic Type walkthrough, physical hardware,
live GPS through folding, and a signed Release archive remain unverified.

## Before release

Unlock the Mac, sign into a non-production test account in the new Debug build,
and repeat all poses/orientations with a chosen Activity filter and a partially
entered form. Repeat on standard phones and iPads. Test synthetic/manual Trip,
Shift, and both consumers together without creating production test records.
Review [DUO_UI_PHASE_2.md](../DUO_UI_PHASE_2.md) before making any visual changes.

No merge, push, deployment, production migration, or build-number increment is
part of this foundation work.
