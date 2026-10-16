import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { View, Text } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { api } from '@/api/client';
import { getAccountGeneration } from '@/features/auth/services/account-boundary';
import type { VehicleData, FuelType } from './types';
import { createVehicleCatalog } from './catalog-flow';
import { SelectionPicker } from './selection-picker';
import { Button, Field, styles } from './ui';
export function VehicleForm({ initial, owner, editing, saving, onSave, onCancel }:
 { initial: VehicleData; owner: string; editing: boolean; saving: boolean; onSave: (data: VehicleData) => void; onCancel: () => void }) {
  const { t } = useLanguage();
  const [state, setState] = useState(() => createVehicleCatalog(initial, async () => [], () => {}).getState());
  const flow = useRef<ReturnType<typeof createVehicleCatalog> | null>(null);
  useEffect(() => {
    const generation = getAccountGeneration();
    const current = createVehicleCatalog(initial, async (path, params) => {
      const response = await api.get(path, { params, deducklyOwnerId: owner, deducklyGeneration: generation });
      if (generation !== getAccountGeneration()) throw Error('Account changed');
      return response.data;
    }, setState);
    flow.current = current; setState(current.getState()); void current.start();
    return () => { current.dispose(); flow.current = null; };
  }, [initial, owner]);
  const d = state.draft;
  function change<K extends keyof VehicleData>(key: K, value: VehicleData[K]) { flow.current?.change(key, value); }
  const fuelChoices = (['gasoline','diesel','hybrid','electric','other'] as FuelType[]).map(value => ({ value, text: t(value) }));
  return <View style={styles.card}>
    <Text style={styles.title}>{t(editing ? 'Edit vehicle' : 'Add vehicle')}</Text>
    {state.manual ? <>
      <Field label="Vehicle year" numeric value={d.year ? String(d.year) : ''} onChange={v => change('year', Number(v))} />
      <Field label="Make" value={d.make} onChange={v => change('make', v)} />
      <Field label="Model" value={d.model} onChange={v => change('model', v)} />
      <Field label="Trim / engine" value={d.trim ?? ''} onChange={v => change('trim', v || null)} />
      <SelectionPicker label="Fuel type" value={d.fuel_type} choices={fuelChoices} onSelect={v => change('fuel_type', v as FuelType)} />
      <Text>{t('For plug-in hybrids or mixed fuels, select the operating mode and enter its consumption manually. Mixed-mode estimates are not supported.')}</Text>
    </> : <>
      <SelectionPicker label="Vehicle year" value={d.year ? String(d.year) : ''} choices={state.years}
        disabled={!state.years.length || saving} onSelect={v => { void flow.current?.year(v); }} />
      {!!d.year && <SelectionPicker label="Make" value={d.make} choices={state.makes} disabled={!state.makes.length || saving}
        onSelect={v => { void flow.current?.make(v); }} />}
      {!!d.make && <SelectionPicker label="Model" value={d.model} choices={state.models} disabled={!state.models.length || saving}
        onSelect={v => { void flow.current?.model(v); }} />}
      {!!d.model && state.configurations.length > 1 && <SelectionPicker label="Configuration / engine" value={d.epa_id ?? ''}
        choices={state.configurations} disabled={state.loading || saving} onSelect={v => { void flow.current?.configuration(v); }} />}
      {state.ready && <>
        <Text>{d.trim}</Text><Text>{t('Fuel type')}: {t(d.fuel_type)}</Text>
        {d.fuel_type === 'electric' ? <Text>{t('Consumption (kWh / 100 miles)')}: {d.kwh_per_100_miles ?? '—'}</Text> : <Text>{t('Estimated combined MPG')}: {d.combined_mpg ?? '—'}</Text>}
        {d.fuel_type !== 'electric' && <Text>{t('Estimated city MPG')}: {d.city_mpg ?? '—'} · {t('Estimated highway MPG')}: {d.highway_mpg ?? '—'}</Text>}
        <Text>{t('EPA estimates. Actual consumption varies. Verify your configuration.')}</Text>
      </>}
    </>}
    {state.loading && <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', gap: 10 }}><ActivityIndicator /><Text>{t('Loading vehicle choices…')}</Text></View>}
    {!!state.error && <Text accessibilityLiveRegion="polite">{t(state.error)}</Text>}
    {(state.ready || state.manual) && (d.fuel_type === 'electric'
      ? <Field label="Consumption (kWh / 100 miles)" numeric value={d.kwh_per_100_miles == null ? '' : String(d.kwh_per_100_miles)} onChange={v => change('kwh_per_100_miles', v === '' ? null : Number(v))} />
      : <Field label="Your MPG override" numeric value={d.custom_mpg == null ? '' : String(d.custom_mpg)} onChange={v => change('custom_mpg', v === '' ? null : Number(v))} />)}
    {!state.loading && (state.ready || state.manual) && (d.fuel_type === 'electric' ? d.kwh_per_100_miles == null : (d.custom_mpg ?? d.combined_mpg) == null) && <Text>{t('Fuel economy unavailable. You can enter a manual estimate.')}</Text>}
    <Button title={state.manual ? 'Use EPA vehicle lookup' : 'Enter vehicle manually'} disabled={saving} onPress={() => {
      flow.current?.manual(!state.manual); if (state.manual) void flow.current?.start();
    }} />
    <Button title={d.is_default ? 'Default vehicle' : 'Make default'} disabled={saving} onPress={() => change('is_default', !d.is_default)} />
    <Button title="Save vehicle" disabled={saving || state.loading || (!state.manual && !state.ready)} onPress={() => onSave(d)} />
    <Button title="Cancel" disabled={saving} onPress={onCancel} />
  </View>;
}
