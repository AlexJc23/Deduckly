import type { FuelType, FuelQuote, Vehicle } from './types';
export function effectiveEconomy(vehicle: Vehicle): number | null {
  return vehicle.fuel_type === 'electric' ? vehicle.kwh_per_100_miles : vehicle.custom_mpg ?? vehicle.combined_mpg;
}
export function defaultVehicle(vehicles: Vehicle[], isPremium: boolean): Vehicle | null {
  return isPremium ? vehicles.find(v => v.is_default && !v.deleted) ?? null : null;
}
export function estimateEnergy(input: { payout: number; miles: number; additionalMiles?: number;
  fuelType: FuelType; economy: number | null; price: number | null }) {
  const { payout, miles, fuelType, economy, price } = input;
  const extra = input.additionalMiles ?? 0;
  if (![payout,miles,extra].every(Number.isFinite) || payout <= 0 || miles <= 0 || extra < 0) return null;
  if (fuelType === 'other' || economy == null || price == null || !Number.isFinite(economy) || economy <= 0 || economy > 1000 || !Number.isFinite(price) || price < 0 || price > 100) return null;
  const drivingMiles = miles + extra;
  const cost = fuelType === 'electric' ? drivingMiles / 100 * economy * price : drivingMiles / economy * price;
  if (!Number.isFinite(cost) || !Number.isFinite(drivingMiles)) return null;
  return { drivingMiles, cost: Math.round(cost * 100) / 100, afterFuel: Math.round((payout - cost) * 100) / 100 };
}
export function usableQuote(quote: FuelQuote | undefined, fuel: FuelType, now = Date.now()): quote is FuelQuote {
  if (!quote) return false;
  const age = now - Date.parse(quote.observed_at);
  return quote.fuel_type === fuel && quote.unit === (fuel === 'electric' ? 'USD/kWh' : 'USD/US-gallon') &&
    Number.isFinite(quote.price) && quote.price > 0 && quote.price <= 100 && age >= 0 && age <= 24 * 60 * 60 * 1000;
}
