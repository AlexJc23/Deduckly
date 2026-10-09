import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { View, Text, ScrollView } from '@/theme/components';
import { BackHeader } from '@/components/ui/BackButton';
import { useLanguage } from '@/i18n/language';
import { useAppTheme } from '@/theme/theme';
import { api } from '@/api/client';
import { getAccountGeneration } from '@/features/auth/services/account-boundary';
import { useVehicles } from '@/features/vehicles/use-vehicles';
import { saveLocalVehicle } from '@/features/vehicles/store';
import type { Vehicle, VehicleData, FuelType } from '@/features/vehicles/types';
import { Button, Field, styles } from '@/features/vehicles/ui';
const empty = (): VehicleData => ({ year: new Date().getFullYear(), make: '', model: '', trim: null,
  fuel_type: 'gasoline', city_mpg: null, highway_mpg: null, combined_mpg: null, custom_mpg: null,
  kwh_per_100_miles: null, epa_id: null, is_default: false });
export default function VehiclesScreen() {
  const state = useVehicles(); const { t } = useLanguage();
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><BackHeader />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
      <Text style={styles.title}>{t('My Vehicles')}</Text>
      {state.owner && state.data ? <VehiclesEditor key={state.owner} state={state} /> : <Text>{t('Sign in to manage vehicles.')}</Text>}
    </ScrollView></KeyboardAvoidingView>;
}
function VehiclesEditor({ state }: { state: ReturnType<typeof useVehicles> }) {
  const { t } = useLanguage(); const { dark } = useAppTheme();
  const [draft, setDraft] = useState<VehicleData | null>(null);
  const [identity, setIdentity] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState<{ kind: string; items: { text: string; value: string }[] } | null>(null);
  const [notice, setNotice] = useState('');
  const owner = state.owner!;
  function change<K extends keyof VehicleData>(key: K, value: VehicleData[K]) {
    setDraft(d => d && ({ ...d, [key]: value }));
  }
  async function lookup(kind: string, value?: string) {
    const generation = getAccountGeneration(); setBusy(true);
    try {
      const config = { deducklyOwnerId: owner, deducklyGeneration: generation };
      if (kind === 'details') {
        const response = await api.get<VehicleData>('/api/v1/vehicles/catalog-details/' + value, config);
        setDraft({ ...response.data, is_default: draft?.is_default ?? false }); setMenu(null);
        setNotice('EPA estimates. Actual consumption varies. Verify your configuration.');
      } else {
        const response = await api.get('/api/v1/vehicles/catalog/' + kind, { ...config, params: {
          year: kind !== 'year' ? draft?.year : undefined,
          make: ['model','options'].includes(kind) ? draft?.make : undefined,
          model: kind === 'options' ? draft?.model : undefined,
        } });
        setMenu({ kind, items: response.data });
        if (!response.data.length) setNotice('No matching vehicles. Enter details manually.');
      }
    } catch { setNotice('Vehicle lookup unavailable. Enter details manually.'); }
    finally { setBusy(false); }
  }
  async function save(data: VehicleData, id?: string, deleted = false) {
    const values = [data.city_mpg, data.highway_mpg, data.combined_mpg, data.custom_mpg, data.kwh_per_100_miles];
    if (!Number.isInteger(data.year) || data.year < 1886 || data.year > 2200 || !data.make.trim() || !data.model.trim() ||
      data.make.length > 100 || data.model.length > 100 || (data.trim?.length ?? 0) > 200 ||
      values.some(n => n !== null && (!Number.isFinite(n) || n <= 0 || n > 1000))) {
      setNotice('Check the year, vehicle details and positive economy values.'); return;
    }
    setBusy(true);
    try {
      // Select only profile fields; never submit server/version fields from an edit.
      const clean = Object.fromEntries(Object.keys(empty()).map(k => [k, data[k as keyof VehicleData]])) as VehicleData;
      await saveLocalVehicle(owner, clean, id, deleted); setDraft(null); setNotice('Saved on this device. Pending changes sync when connected.');
      void state.sync();
    } catch { setNotice('Could not save locally. Your changes are still in the form.'); }
    finally { setBusy(false); }
  }
  function edit(v: Vehicle) { setIdentity(v.id); setDraft(v); setMenu(null); setNotice(''); }
  return <>
    <Text>{t('Vehicle estimates use US miles, US gallons and USD. Electric consumption uses kWh per 100 miles.')}</Text>
    {(state.problem || !!state.data?.pending.length) && <Text>{t('Pending or offline. Your vehicle changes remain on this device. Retry synchronization when connected.')}</Text>}
    <Button title="Sync vehicles" onPress={() => { void state.sync(); }} />
    {state.data?.vehicles.filter(v => !v.deleted).map(v => <View key={v.id} style={styles.card}>
      <Text style={{ fontSize: 19, fontWeight: '700' }}>{v.year} {v.make} {v.model}</Text>
      <Text>{v.trim}</Text><Text>{t(v.fuel_type)} {v.is_default ? '· ' + t('Default vehicle') : ''}</Text>
      <Text>{v.fuel_type === 'electric' ? `${v.kwh_per_100_miles ?? '—'} kWh/100 mi` : `${v.custom_mpg ?? v.combined_mpg ?? '—'} MPG`}</Text>
      <Button title="Edit vehicle" onPress={() => edit(v)} />
      {!v.is_default && <Button title="Make default" disabled={busy} onPress={() => { void save({ ...v, is_default: true }, v.id); }} />}
      <Button title="Delete vehicle" disabled={busy} onPress={() => Alert.alert(t('Delete vehicle'), t('Trips and reports will not be deleted.'), [
        { text: t('Cancel'), style: 'cancel' }, { text: t('Delete'), style: 'destructive', onPress: () => { void save(v, v.id, true); } },
      ])} />
    </View>)}
    <Button title="Add vehicle" onPress={() => { setIdentity(undefined); setDraft(empty()); setMenu(null); setNotice(''); }} />
    {!!notice && <Text accessibilityLiveRegion="polite">{t(notice)}</Text>}
    {draft && <View style={styles.card}>
      <Text style={styles.title}>{t(identity ? 'Edit vehicle' : 'Add vehicle')}</Text>
      <Field label="Vehicle year" numeric value={String(draft.year || '')} onChange={v => change('year', Number(v))} />
      <Button title="Find year (EPA)" disabled={busy} onPress={() => { void lookup('year'); }} />
      <Field label="Make" value={draft.make} onChange={v => change('make', v)} />
      <Button title="Find make (EPA)" disabled={busy} onPress={() => { void lookup('make'); }} />
      <Field label="Model" value={draft.model} onChange={v => change('model', v)} />
      <Button title="Find model (EPA)" disabled={busy || !draft.make} onPress={() => { void lookup('model'); }} />
      <Field label="Trim / engine" value={draft.trim ?? ''} onChange={v => change('trim', v || null)} />
      <Button title="Find configuration (EPA)" disabled={busy || !draft.model} onPress={() => { void lookup('options'); }} />
      {menu && <View><Text>{t('Select a result')}</Text><Picker selectedValue="" style={{ color: dark ? '#FFFFFF' : '#111827' }} onValueChange={value => {
        if (!value) return;
        if (menu.kind === 'options') { void lookup('details', String(value)); return; }
        if (menu.kind === 'year') setDraft({ ...empty(), year: Number(value) });
        if (menu.kind === 'make') setDraft({ ...empty(), year: draft.year, make: String(value) });
        if (menu.kind === 'model') setDraft({ ...empty(), year: draft.year, make: draft.make, model: String(value) });
        setMenu(null);
      }}><Picker.Item label={t('Select a result')} value="" />{menu.items.map(i => <Picker.Item key={i.value} label={i.text} value={i.value} />)}</Picker></View>}
      <Text>{t('Fuel type')}</Text><Picker selectedValue={draft.fuel_type} style={{ color: dark ? '#FFFFFF' : '#111827' }} onValueChange={v => change('fuel_type', v as FuelType)}>
        {(['gasoline','diesel','hybrid','electric','other'] as const).map(v => <Picker.Item key={v} label={t(v)} value={v} />)}
      </Picker>
      <Text>{t('For plug-in hybrids or mixed fuels, select the operating mode and enter its consumption manually. Mixed-mode estimates are not supported.')}</Text>
      {(draft.fuel_type === 'electric' ? [['kwh_per_100_miles','Consumption (kWh / 100 miles)']] : [
        ['city_mpg','Estimated city MPG'],['highway_mpg','Estimated highway MPG'],['combined_mpg','Estimated combined MPG'],['custom_mpg','Your MPG override'],
      ]).map(([key,label]) => <Field key={key} label={label} numeric value={draft[key as keyof VehicleData] == null ? '' : String(draft[key as keyof VehicleData])}
        onChange={v => change(key as 'custom_mpg', v === '' ? null : Number(v))} />)}
      <Button title={draft.is_default ? 'Default vehicle' : 'Make default'} onPress={() => change('is_default', !draft.is_default)} />
      <Button title="Save vehicle" disabled={busy} onPress={() => { void save(draft, identity); }} />
      <Button title="Cancel" onPress={() => { setDraft(null); setMenu(null); }} />
    </View>}
  </>;
}
