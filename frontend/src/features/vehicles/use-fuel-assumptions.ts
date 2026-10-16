import { useEffect } from 'react';
import { api } from '@/api/client';
import { getAccountGeneration } from '@/features/auth/services/account-boundary';
import { usePremium } from '@/features/subscriptions/hooks/use-premium';
import { useVehicles } from './use-vehicles';
import { fuelAssumptions } from './assumptions';
import { saveQuote } from './store';
import { usableQuote } from './energy';
import type { FuelQuote } from './types';
export function useFuelAssumptions() {
 const state = useVehicles(); const { isPremium } = usePremium();
 const fuel = state.data?.vehicles.find(v => v.is_default && !v.deleted)?.fuel_type;
 const postal = state.data?.postalCode; const owner = state.owner;
 useEffect(() => {
  if (!isPremium || !owner || !fuel || fuel === 'other' || !postal || !/^\d{5}$/.test(postal)) return;
  let active = true; const generation = getAccountGeneration();
  void api.get<{ quote: FuelQuote | null }>('/api/v1/vehicles/fuel-price', {
   deducklyOwnerId: owner, deducklyGeneration: generation, params: { postal_code: postal, fuel_type: fuel },
  }).then(async response => {
   if (active && generation === getAccountGeneration() && usableQuote(response.data.quote ?? undefined, fuel))
    await saveQuote(owner, postal, response.data.quote!);
  }).catch(() => {}); // Missing provider/network preserves manual/cached prices.
  return () => { active = false; };
 }, [isPremium, owner, fuel, postal]);
 return { ...state, assumptions: fuelAssumptions(state.data, isPremium) };
}
