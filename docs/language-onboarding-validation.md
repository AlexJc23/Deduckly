# Language and onboarding validation — 7 September 2026

English/Español is selectable in Preferences and changes app-owned copy immediately. The language is stored locally as `deduckly.language`; switching languages does not call an account update API. Translation callbacks and displayed dates explicitly depend on language to support React Compiler memoization.

The onboarding sequence is Location → Notifications → Goals → Welcome. Goals use existing daily/monthly income fields and the existing user endpoint. Empty fields are omitted, Skip makes no account update, invalid amounts do not advance, and failed saves remain on the goals step. Previously completed v1 onboarding remains completed under v2.

## Checks passed

- TypeScript (`tsc --noEmit`) and targeted ESLint.
- `node scripts/verify-language-onboarding.cjs`: synchronous language subscriptions, ordered persistence, translation fallback/interpolation, user text and business names unchanged, goal validation and actual screen save/skip/failure callbacks with a mocked API, per-account onboarding migration, 12 English/Spanish phone/tablet renders in both themes.
- `node scripts/verify-theme.cjs`, `verify-reports.cjs`, and `verify-animation-boundaries.cjs`.
- `git diff --check`.
- Expo web export compiled successfully before the final reactive-language corrections; the final native build below includes the subsequent corrections.

## Limits

These are frontend regression checks, not a full security audit. No backend, database, authentication storage, or account data model changes were made for this feature. Existing unrelated working-tree changes were preserved. Tests used synthetic data and mocked writes; no real account was changed.

Server-generated messages, exported server documents, and full legal documents remain in their original language. Native permission prompts follow the operating system language.

Before public release, validate the signed archive in Xcode and smoke-test on a small iPhone and iPad in TestFlight: switch English ↔ Español while screens are open, relaunch to check persistence, save/skip onboarding goals, and verify existing trip/income/expense records. Check both themes, keyboard visibility and larger text. Browser accessibility preview was inspected, but screenshot verification was blocked by an account usage limit.

## Native Release result

Unsigned generic iOS Release build succeeded with zero errors and 2,282 warning lines. Processed app metadata is version 1.0.0, build 9. This is compilation verification, not signed archive validation or App Store acceptance. Build log: `/tmp/deduckly-language-release.log`. Third-party dependency source was not modified.
