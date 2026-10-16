import type { OfferInput, OfferPreferences } from '../types/offer.types';
import type { FuelAssumptions } from '../../vehicles/assumptions';
import { estimateEnergy, MAX_QUOTE_AGE_MS } from '../../vehicles/energy';
import { analyzeOffer } from './verdict';
import { analyzePremiumOffer } from './premium';
import { calculateHourlyRate } from './calculations';
export function analyzeIntegratedOffer(input: OfferInput, preferences: OfferPreferences | null, assumptions: FuelAssumptions | null, now = Date.now()) {
 // Additional miles formerly lived in the separate energy panel. Count them
 // once in fuel, per-mile targets and the distance preference in this one engine.
 const extra = input.additionalMiles ?? 0;
 if (!Number.isFinite(extra) || extra < 0) throw new Error('Additional miles must be a nonnegative number.');
 const evaluated = { ...input, distance: input.distance + extra };
 if (!Number.isFinite(input.distance) || input.distance <= 0) throw new Error('Payout and distance must be positive numbers.');
 // Recheck quote age at Analyze time, including screens left open overnight.
 const usable = assumptions && (!assumptions.observedAt || (now - Date.parse(assumptions.observedAt) >= 0 && now - Date.parse(assumptions.observedAt) <= MAX_QUOTE_AGE_MS));
 const energy = usable && assumptions ? estimateEnergy({ payout: input.payout, miles: evaluated.distance, fuelType: assumptions.fuelType, economy: assumptions.economy, price: assumptions.price }) : null;
 const fuelCost = energy?.cost ?? null;
 // Verdict math permits negative earnings; validation remains on the original offer.
 const result = preferences ? analyzePremiumOffer(evaluated, preferences, fuelCost) : analyzeOffer(evaluated, fuelCost);
 return { ...result, fuel: { cost: fuelCost, afterFuel: energy?.afterFuel ?? null, grossPayout: input.payout, drivingMiles: evaluated.distance,
  grossDollarsPerMile: Number((input.payout / evaluated.distance).toFixed(2)), grossHourly: calculateHourlyRate(input.payout, input.estimatedTime), assumptions },
  reasons: [...result.reasons, fuelCost === null ? 'Fuel estimate unavailable; gross-only mileage analysis.' : 'Mileage and hourly recommendations include estimated fuel expense.'] };
}
