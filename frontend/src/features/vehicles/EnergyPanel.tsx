import { useEffect, useRef, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { View, Text } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { useAppTheme } from '@/theme/theme';
import { usePremium } from '@/features/subscriptions/hooks/use-premium';
import { api } from '@/api/client';
import { getAccountGeneration } from '@/features/auth/services/account-boundary';
import type { OfferInput } from '@/features/offer-analyzer/types/offer.types';
import { useVehicles } from './use-vehicles';
import { savePrice, saveQuote } from './store';
import { defaultVehicle, effectiveEconomy, estimateEnergy, usableQuote } from './energy';
import type { FuelType, FuelQuote } from './types';
import { Button, Field, styles } from './ui';
export function EnergyPanel({ offer }: { offer: OfferInput | null }) {
  const state = useVehicles();
  return state.owner && state.data ? <EnergyEditor key={state.owner} state={state} offer={offer} /> : null;
}
function EnergyEditor({ state, offer }: { state: ReturnType<typeof useVehicles>; offer: OfferInput | null }) {
  const { t, locale } = useLanguage(); const { dark } = useAppTheme(); const { isPremium } = usePremium();
  const [selection, setSelection] = useState<string | null>(null);
  const vehicles = state.data!.vehicles.filter(v => !v.deleted);
  const selected = selection === null ? defaultVehicle(vehicles, isPremium) : vehicles.find(v => v.id === selection);
  const [manualFuel, setManualFuel] = useState<FuelType>('gasoline');
  const fuel = selected?.fuel_type ?? manualFuel;
  const [override, setOverride] = useState('');
  const [price, setPrice] = useState(state.data!.prices[fuel] ?? '');
  const [extra, setExtra] = useState('');
  const [postal, setPostal] = useState('');
  const [quote, setQuote] = useState<FuelQuote | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const priceRequest = useRef(0);
  const mounted = useRef(true);
  const [, setNow] = useState(Date.now());
  useEffect(() => { mounted.current = true; const timer = setInterval(() => setNow(Date.now()), 60000); return () => { clearInterval(timer); mounted.current = false; }; }, []);
  useEffect(() => { priceRequest.current++; setBusy(false); }, [fuel, isPremium]);
  const owner = state.owner!;
  const savedPrices = useRef(state.data!.prices);
  savedPrices.current = state.data!.prices;
  useEffect(() => { setPrice(savedPrices.current[fuel] ?? ''); setQuote(null); }, [fuel]);
  const economy = override === '' ? selected ? effectiveEconomy(selected) : null : Number(override);
  const quoteExpired = !!quote && (!isPremium || !usableQuote(quote, fuel));
  const estimate = !quoteExpired && offer && estimateEnergy({ payout: offer.payout, miles: offer.distance, additionalMiles: Number(extra), fuelType: fuel,
    economy, price: price === '' ? null : Number(price) });
  async function manual(value: string) {
    priceRequest.current++; setBusy(false); setPrice(value); setQuote(null);
    try { await savePrice(owner, fuel, value); }
    catch { setNotice('Price could not be saved on this device.'); }
  }
  async function automatic() {
    const request = ++priceRequest.current;
    setBusy(true); setNotice('');
    const cached = state.data!.quotes[postal + ':' + fuel];
    const generation = getAccountGeneration();
    try {
      const response = await api.get<{ status: string; quote: FuelQuote | null }>('/api/v1/vehicles/fuel-price', {
        deducklyOwnerId: owner, deducklyGeneration: generation, params: { postal_code: postal, fuel_type: fuel },
      });
      if (!mounted.current || request !== priceRequest.current) return;
      const q = response.data.quote;
      if (!q || !usableQuote(q, fuel)) throw Error('Unavailable');
      await saveQuote(owner, postal, q); if (!mounted.current || request !== priceRequest.current) return; setQuote(q); setPrice(String(q.price));
    } catch {
      if (!mounted.current || generation !== getAccountGeneration() || request !== priceRequest.current) return;
      if (usableQuote(cached, fuel)) { setQuote(cached); setPrice(String(cached.price)); setNotice('Using a cached estimate. Check its date before using it.'); }
      else { setQuote(null); setPrice(savedPrices.current[fuel] ?? ''); setNotice('Local pricing is unavailable. Enter your price manually.'); }
    } finally { if (request === priceRequest.current) setBusy(false); }
  }
  return <View style={styles.card}>
    <Text style={{ fontSize: 20, fontWeight: '800' }}>{t('Fuel / energy estimate')}</Text>
    <Text>{t('Vehicle estimates use US miles, US gallons and USD. Electric consumption uses kWh per 100 miles.')}</Text>
    <Button title="My Vehicles" onPress={() => router.push('/settings/vehicles')} />
    <Text>{t('Vehicle for this offer')}</Text><Picker selectedValue={selected?.id ?? ''} style={{ color: dark ? '#FFFFFF' : '#111827' }} onValueChange={v => { setSelection(String(v)); setOverride(''); }}>
      <Picker.Item label={t('Manual entry')} value="" />{vehicles.map(v => <Picker.Item key={v.id} label={`${v.year} ${v.make} ${v.model}`} value={v.id} />)}
    </Picker>
    {!selected && <Picker selectedValue={manualFuel} style={{ color: dark ? '#FFFFFF' : '#111827' }} onValueChange={v => setManualFuel(v)}>
      {(['gasoline','diesel','hybrid','electric'] as const).map(v => <Picker.Item key={v} label={t(v)} value={v} />)}
    </Picker>}
    {selected && <Text>{t('Saved consumption')}: {effectiveEconomy(selected) ?? '—'} {fuel === 'electric' ? 'kWh/100 mi' : 'MPG'}</Text>}
    <Field label={fuel === 'electric' ? 'Consumption override (kWh / 100 miles)' : 'MPG for this offer (optional override)'} value={override} onChange={setOverride} numeric />
    <Field label={fuel === 'electric' ? 'Electricity price (USD / kWh)' : 'Fuel price (USD / US gallon)'} value={price} onChange={v => { void manual(v); }} numeric />
    <Field label="Additional / return miles (optional)" value={extra} onChange={setExtra} numeric />
    {isPremium && fuel !== 'other' && <>
      <Field label="US ZIP code for price estimate" value={postal} onChange={value => { priceRequest.current++; setBusy(false); setPostal(value); setQuote(null); setPrice(state.data!.prices[fuel] ?? ''); }} numeric />
      <Button title="Get local price estimate" disabled={busy || !/^\d{5}$/.test(postal)} onPress={() => { void automatic(); }} />
    </>}
    {quoteExpired && <Text>{t('This price estimate has expired. Enter a manual price or request another estimate.')}</Text>}
    {quote && <Text>{quote.source} · {quote.location} · {new Date(quote.observed_at).toLocaleString(locale)}</Text>}
    {!!notice && <Text accessibilityLiveRegion="polite">{t(notice)}</Text>}
    {!offer ? <Text>{t('Analyze an offer above to see its fuel estimate.')}</Text> : estimate ? <>
      <Text>{t('Gross offer payout')}: ${offer.payout.toFixed(2)}</Text>
      <Text>{t('Estimated driving miles')}: {estimate.drivingMiles.toFixed(2)}</Text>
      <Text>{t('Estimated fuel / energy cost')}: ${estimate.cost.toFixed(2)}</Text>
      <Text style={{ fontWeight: '700' }}>{t('Estimated earnings after fuel / energy')}: ${estimate.afterFuel.toFixed(2)}</Text>
    </> : <Text>{t('Enter valid consumption and price to estimate fuel costs. Unsupported mixed fuels require manual mode selection.')}</Text>}
    <Text>{t('This is not profit or take-home pay. Maintenance, depreciation, taxes, insurance and other costs are not included. Existing analyzer recommendations are unchanged.')}</Text>
  </View>;
}
