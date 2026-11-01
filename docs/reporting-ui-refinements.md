# Reporting and iOS refinements

- Free accounts can request only the current calendar month in their account timezone. The report includes previous-calendar-month summary totals; historical report detail, daily, custom, and vehicle filters require Premium. The dashboard today endpoint remains available.
- Monthly comparisons label a full previous calendar month and avoid a percentage when the previous value is zero. January compares with December of the prior year.
- Financial summaries stay visible; expenses, deductions, and tax estimates expand on demand. Premium keeps historical/custom dates, vehicle filters, and exports.
- The dashboard remains non-scrolling. Phone layouts distribute the available vertical space and reduce decoration as space tightens. Active shifts reserve additional room. Very short windows or larger accessibility text use More actions and View details.
- Shift setup exposes the optional saved fuel price. Gasoline uses USD per US gallon; electric vehicles use USD per kWh. Blank preserves the saved price, and no expense is created.

## Dependency compatibility

Frontend uses Expo SDK 58 and its prescribed native module versions, React Native 0.88.1 and React 19.3.0. Native projects use Expo’s scene lifecycle, preserve Siri shortcuts, and require iOS 16.4 or newer. Build a new iOS development client after installing these dependencies; the SDK 54 simulator binary cannot load the SDK 58 JavaScript runtime.

- TypeScript is 6.0.3 because the current Expo lint parser supports versions below 6.1.
- ESLint remains on 9.39.5 because Expo’s React plugin does not support ESLint 10.
- RevenueCat uses the latest 10.x release (10.16.0); version 11 requires PurchasesHybridCommon 20.1.0, which was unavailable from CocoaPods during validation.
- Expo-prescribed module versions take precedence over independently newer module releases.
- Backend requirements were resolved for the deployed Python 3.11 runtime. bcrypt stays below 4 for the existing Passlib integration; replacing it requires a separate password-hash migration.

Regenerate backend requirements from the repository root with `uv pip compile --python-version 3.11 --upgrade backend/requirements.in -o backend/requirements.txt`.

## Rollout

The frontend currently connects to the hosted API. Deploy the backend changes before expecting report comparisons and server-enforced Free date limits in that environment. No production deployment is included in this change.
