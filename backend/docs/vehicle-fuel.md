# Vehicle and fuel integration

The optional `user_vehicles` table is introduced by `ef05b162c980`, following
`de94a051b879`. Existing user/trip/auth/subscription contracts are unchanged.
Apply and test the migration in staging before enabling the new backend routes.
No migration has been run against production. Downgrade refuses to drop nonempty
profiles. Account deletion cascades to profiles; profile deletion never touches trips.
Soft-deleted profiles retain only their vehicle details/version for safe retry handling.

Vehicle data: https://www.fueleconomy.gov/feg/ws/index.shtml
Public DOE/EPA menus and vehicle details; server caches catalog entries for one day
(up to 256 entries). MPG is for US gallons; EV `combE` is kWh/100 miles, never MPGe.
Unsupported dual-fuel/PHEV modes remain manual; no blended estimate is invented.
All fuel estimates currently use USD, US miles and US gallons, explicitly labeled.

Local retail prices: no licensed provider is configured. OPIS provides commercial
retail pricing (https://www.opis.com/product/pricing/retail-fuel-prices/), but pricing,
coverage and mobile redistribution rights require a commercial agreement.
Do not substitute wholesale or nationwide EPA prices for a local retail quote.
No account, subscription, purchase, key, location permission or scraping was added.

After provider approval, implement `FuelPriceProvider.lookup` in
`app/services/fuel_price_service.py`, keep credentials on the server, and validate
fuel grade, location precision, units, timestamp and licensing/cache limits.
The endpoint uses the existing server subscription check. It returns unavailable
on provider errors. The app caches quotes by account/ZIP/fuel and accepts only
quotes no older than 24 hours; source, location and observation time remain visible.
Manual price always overrides an automatic lookup, including a late response.

Offline profiles and mutations are stored per authenticated owner. Stable UUIDs,
operation IDs and expected versions protect retries. Logout retains pending edits.
A cross-device version conflict returns 409 and retains the local queue instead
of overwriting server data; reconciliation is required before that queue can drain.
Profiles are not tied to Trips, income, Shift records or report calculations.

Before release: test migration on a staging PostgreSQL copy, the released build 37
against that backend, new account/offline flows on physical iPhone/iPad, and
Android UI. Existing automated regression success is not a physical build-37 test.
