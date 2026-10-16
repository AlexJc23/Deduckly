import { effectiveEconomy, usableQuote } from './energy';
import type { VehicleJournal } from './types';
export type FuelAssumptions = { economy: number | null; price: number | null; fuelType: import('./types').FuelType;
 vehicle: string; source: string; observedAt?: string; location?: string };
export function fuelAssumptions(journal: VehicleJournal | null, premium: boolean): FuelAssumptions | null {
 const v = journal?.vehicles.find(v => v.is_default && !v.deleted);
 if (!v || !journal) return null;
 const manual = journal.prices[v.fuel_type];
 const hasManual = manual !== undefined && manual.trim() !== '';
 const q = journal.quotes[(journal.postalCode ?? '') + ':' + v.fuel_type];
 const cached = premium && usableQuote(q, v.fuel_type) ? q : null;
 return { economy: effectiveEconomy(v), fuelType: v.fuel_type,
  price: hasManual ? Number(manual) : cached?.price ?? null,
  vehicle: `${v.year} ${v.make} ${v.model}`, source: hasManual ? 'Saved manual fuel price' : cached ? cached.source : 'Fuel price unavailable',
  observedAt: !hasManual ? cached?.observed_at : undefined, location: !hasManual ? cached?.location : undefined };
}
