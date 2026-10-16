import { View, Text } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { usePremium } from '@/features/subscriptions/hooks/use-premium';
import { useFuelAssumptions } from './use-fuel-assumptions';
import { savePrice, saveFuelArea } from './store';
import { Field } from './ui';
import { useState } from 'react';
import { getAccountGeneration } from '@/features/auth/services/account-boundary';
import { useFuelPriceEditor } from './use-fuel-price-editor';
export function FuelPreferences() {
 const state = useFuelAssumptions(); const { t } = useLanguage(); const { isPremium } = usePremium();
 const [error, setError] = useState(false);
 const a = state.assumptions; const owner = state.owner;
 const generation = getAccountGeneration();
 const fuel = a?.fuelType ?? 'gasoline';
 const price = useFuelPriceEditor(state.data?.prices[fuel] ?? '', `${generation}:${owner ?? 'guest'}:${fuel}`,
  owner ? value => {
   if (generation !== getAccountGeneration()) return Promise.reject(new Error('Account changed'));
   return savePrice(owner, fuel, value);
  } : undefined, true);
 const persist = (op: Promise<unknown>) => { void op.then(() => setError(false)).catch(() => setError(true)); };
 return <View style={{ gap: 12 }}>
  <Text>{t('Fuel-aware offer preferences')}</Text>
  <Text>{a ? a.vehicle : t('Set your default vehicle in Settings → My Vehicles.')}</Text>
  {a && owner && <Field label={a.fuelType === 'electric' ? 'Electricity price (USD / kWh)' : 'Fuel price (USD / US gallon)'}
   value={price.value} numeric onChange={price.change} onBlur={price.commit} />}
  {isPremium && owner && <Field label="US ZIP code for price estimate" value={state.data?.postalCode ?? ''} numeric onChange={v => persist(saveFuelArea(owner, v))} />}
  <Text>{t('Saved manual prices override automatic estimates. Clear the price to use an available automatic estimate.')}</Text>
  {a && <Text>{t(a.source)}{a.location ? ' · ' + a.location : ''}{a.observedAt ? ' · ' + t('Cached price estimate') + ' · ' + new Date(a.observedAt).toLocaleString() : ''}</Text>}
  {isPremium && <Text>{t('If a local fuel estimate is unavailable, enter a manual price. Valid cached estimates may be used while offline.')}</Text>}
  {!price.parsed.valid && <Text>{t('Enter a price from $0 to $100, or leave it blank.')}</Text>}
  {(error || price.error) && <Text>{t('Price could not be saved on this device.')}</Text>}
 </View>;
}
