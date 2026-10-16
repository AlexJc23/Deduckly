import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { View, Text, ScrollView } from '@/theme/components';
import { BackHeader } from '@/components/ui/BackButton';
import { useLanguage } from '@/i18n/language';
import { useVehicles } from '@/features/vehicles/use-vehicles';
import { saveLocalVehicle } from '@/features/vehicles/store';
import type { Vehicle, VehicleData } from '@/features/vehicles/types';
import { Button, styles } from '@/features/vehicles/ui';
import { VehicleForm } from '@/features/vehicles/VehicleForm';
const empty = (): VehicleData => ({ year: 0, make: '', model: '', trim: null,
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
  const { t } = useLanguage();
  const [draft, setDraft] = useState<VehicleData | null>(null);
  const [identity, setIdentity] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const owner = state.owner!;
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
  function edit(v: Vehicle) { setIdentity(v.id); setDraft(v); setNotice(''); }
  return <>
    <Text>{t('Vehicle estimates use US miles, US gallons and USD. Electric consumption uses kWh per 100 miles.')}</Text>
    {(state.problem || !!state.data?.pending.length) && <Text>{t('Pending or offline. Your vehicle changes remain on this device. Retry synchronization when connected.')}</Text>}
    <Button title="Sync vehicles" onPress={() => { void state.sync(); }} />
    {state.data?.vehicles.filter(v => !v.deleted).map(v => <View key={v.id} style={styles.card}>
      <Text style={{ fontSize: 19, fontWeight: '700' }}>{v.year} {v.make} {v.model}</Text>
      <Text>{v.trim}</Text><Text>{t(v.fuel_type)} {v.is_default ? '· ' + t('Default vehicle') : ''}</Text>
      <Text>{v.fuel_type === 'electric' ? `${v.kwh_per_100_miles ?? '—'} kWh/100 mi` : `${v.custom_mpg ?? v.combined_mpg ?? '—'} MPG`}</Text>
      {(v.fuel_type === 'electric' ? v.kwh_per_100_miles == null : (v.custom_mpg ?? v.combined_mpg) == null) && <Text>{t('Fuel economy unavailable. Edit your vehicle to enter a manual estimate.')}</Text>}
      <Button title="Edit vehicle" disabled={busy || !!draft} onPress={() => edit(v)} />
      {!v.is_default && <Button title="Make default" disabled={busy || !!draft} onPress={() => { void save({ ...v, is_default: true }, v.id); }} />}
      <Button title="Delete vehicle" disabled={busy || !!draft} onPress={() => Alert.alert(t('Delete vehicle'), t('Trips and reports will not be deleted.'), [
        { text: t('Cancel'), style: 'cancel' }, { text: t('Delete'), style: 'destructive', onPress: () => { void save(v, v.id, true); } },
      ])} />
    </View>)}
    <Button title="Add vehicle" disabled={!!draft || busy} onPress={() => { setIdentity(undefined); setDraft({ ...empty(), is_default: !state.data?.vehicles.some(v => !v.deleted) }); setNotice(''); }} />
    {!!notice && <Text accessibilityLiveRegion="polite">{t(notice)}</Text>}
    {draft && <VehicleForm key={identity ?? 'new'} initial={draft} owner={owner} editing={!!identity} saving={busy}
      onSave={data => { void save(data, identity); }} onCancel={() => setDraft(null)} />}
  </>;
}
