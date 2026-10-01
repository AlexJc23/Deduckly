import { DurationPicker } from '@/features/shifts/duration-picker';
import { plannedEndAt } from '@/features/shifts/duration';
import { requestShiftNotifications } from '@/features/shifts/notifications';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, Pressable } from '@/theme/components';
import { useAppTheme } from '@/theme/theme';
import { useLanguage } from '@/i18n/language';
import { useShifts } from '@/features/shifts/context';
import { editShift, switchPlatform, requestTripSave } from '@/features/shifts/journal';
import { startShiftRecording, endShiftRecording, getRecordingMode, subscribeToRecording } from '@/features/tracking/services/background-tracking';
const platforms = ['spark', 'doordash', 'uber_eats', 'uber', 'lyft', 'grubhub', 'instacart', 'amazon_flex', 'shipt', 'other'];
export default function ShiftsScreen() {
  const { owner, entries, syncError, sync } = useShifts();
  const { t, locale } = useLanguage(); const { dark } = useAppTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const [selected, setSelected] = useState<string | null>(params.id ?? null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(0); const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now()); const [mode, setMode] = useState(getRecordingMode());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); const off = subscribeToRecording(() => setMode(getRecordingMode())); return () => { clearInterval(timer); off(); }; }, []);
  useEffect(() => { if (params.id) setSelected(params.id); }, [params.id]);
  const active = entries.find(e => e.local && !e.data.ended_at);
  const entry = entries.find(e => e.data.client_id === selected) ?? active;
  const foreground = dark ? '#EDF3FA' : '#273449';
  async function act(fn: () => Promise<unknown>) {
    if (!owner || busy) return;
    setBusy(true);
    try { await fn(); void sync(); }
    catch { Alert.alert(t('Shift could not be updated'), t('Saved Shift data remains on this device. Check permissions and storage, then try again.')); }
    finally { setBusy(false); }
  }
  const planned = () => plannedEndAt(Date.now(), minutes);
  const platformLabel = (value: string) => value === 'other' ? t('Other') : ({ spark: 'Spark', doordash: 'DoorDash', uber_eats: 'Uber Eats', uber: 'Uber', lyft: 'Lyft', grubhub: 'Grubhub', instacart: 'Instacart', amazon_flex: 'Amazon Flex', shipt: 'Shipt' }[value] ?? value);
  const date = (value: string) => new Date(value).toLocaleString(locale);
  function button(label: string, fn: () => void, chosen = false, key = label) {
    return <Pressable key={key} disabled={busy || !owner} onPress={fn} accessibilityRole="button" accessibilityState={{ disabled: busy || !owner, selected: chosen }} style={[styles.button, chosen && styles.chosen]}><Text style={{ color: chosen ? '#FFFFFF' : foreground }}>{label}</Text></Pressable>;
  }
  function platformButtons(fn: (p: string | null) => void, current: string | null) {
    return <View style={styles.row}>{button(t('No platform'), () => fn(null), current === null)}{platforms.map(p => button(platformLabel(p), () => fn(p), current === p))}</View>;
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: dark ? '#101722' : '#F8FAFC' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {button(t('Back'), () => router.back())}
        <Text style={styles.title}>{t('Shift Mode')}</Text>
        <Text>{t('Shift mileage is separate from reports and deductions. Review detected segments before classifying them as Business.')}</Text>
        {!owner && <Text>{t('Sign in to manage Shifts.')}</Text>}
        {syncError && <Text accessibilityRole="alert">{t('Sync needs attention. Data is saved locally; a server conflict may need review.')}</Text>}
        {button(t('Sync now'), () => void sync())}
        {!active && <View style={styles.card}>
          <Text style={styles.heading}>{t('Start Shift')}</Text>
          <Text>{t('Active platform')}</Text>{platformButtons(setPlatform, platform)}
          <Text>{t('End in (optional)')}</Text>
          <DurationPicker value={minutes} onChange={setMinutes} />
          {button(t('Start Shift'), () => void act(async () => {
            if (!await startShiftRecording(owner!, platform, planned())) throw Error('Location unavailable');
            setSelected(null);
            if (minutes) await requestShiftNotifications();
          }))}
        </View>}
        {entry && <View style={styles.card}>
          <Text style={styles.heading}>{t(entry.data.ended_at ? 'Shift summary' : 'Shift in progress')}</Text>
          <Text>{date(entry.data.started_at)}</Text>
          <Text>{t('Elapsed minutes')}: {Math.max(0, Math.floor(((entry.data.ended_at ? Date.parse(entry.data.ended_at) : now)-Date.parse(entry.data.started_at))/60000))}</Text>
          <Text>{t(entry.dirty || entry.pending ? 'Pending sync' : 'Synced')}</Text>
          {!entry.data.ended_at && <>
            <Text>{t(!entry.local ? 'This Shift was started on another device.' : mode === 'background' ? 'Background recording active' : mode === 'foreground' ? 'Keep the app open to record mileage.' : 'Recording paused. Check location access and reopen the app.')}</Text>
            {entry.data.planned_end_at && <Text>{t('Planned end')}: {date(entry.data.planned_end_at)}{now > Date.parse(entry.data.planned_end_at) ? ` · ${t('Planned end reached; waiting for the current drive to finish.')}` : ''}</Text>}
            <Text>{t('End in (optional)')}</Text>
            <DurationPicker value={minutes} onChange={setMinutes} />
            {button(t('Update planned end'), () => void act(async () => { await editShift(owner!, entry.data.client_id, e => { e.data.planned_end_at = planned(); }); if (minutes) await requestShiftNotifications(); }))}
            {entry.local && <><Text style={styles.heading}>{t('Switch platform')}</Text>{platformButtons(p => void act(() => switchPlatform(owner!, entry.data.client_id, p)), entry.data.platform_sessions.find(p => !p.ended_at)?.platform ?? null)}
            {button(t('End Shift'), () => Alert.alert(t('End Shift?'), t('Saved segments will remain available for review.'), [{ text: t('Cancel'), style: 'cancel' }, { text: t('End Shift'), onPress: () => void act(() => endShiftRecording(owner!, entry.data.client_id)) }]))}</>}
          </>}
          <Text style={styles.heading}>{t('Platform history')}</Text>
          {entry.data.platform_sessions.map(p => <Text key={p.client_id}>{platformLabel(p.platform)} · {date(p.started_at)} — {p.ended_at ? date(p.ended_at) : t('Active')}</Text>)}
          <Text style={styles.heading}>{t('Review segments')}</Text>
          <Text>{t('Recorded miles')}: {entry.data.segments.filter(s => !s.excluded).reduce((n,s) => n+Number(s.distance_miles), 0).toFixed(2)}</Text>
          {!entry.data.segments.length && <Text>{t('No completed driving segments yet. Sustained driving is detected automatically.')}</Text>}
          {entry.data.segments.map(s => <View key={s.client_id} style={styles.card}>
            <Text>{date(s.started_at)} — {s.ended_at ? date(s.ended_at) : t('Active')}</Text>
            <Text>{Number(s.distance_miles).toFixed(2)} {t('miles')}</Text>
            {s.converted_at ? <Text>{t('Saved as a Trip. Make further changes in Trips.')}</Text> : <>
            {entry.blockedSegments?.includes(s.client_id) && <Text accessibilityRole="alert">{t('This segment overlaps an existing Trip or needs mileage review. It has not been saved again.')}</Text>}
            {s.save_requested && <Text>{t('Trip save queued. Waiting for synchronization.')}</Text>}
            {s.reviewed === false && <Text>{t('Not reviewed. Defaults to Business after midnight.')}</Text>}
            <View style={styles.row}>{(['business', 'personal'] as const).map(category => button(t(category === 'business' ? 'Business' : 'Personal'), () => void act(() => editShift(owner!, entry.data.client_id, e => { const target = e.data.segments.find(item => item.client_id === s.client_id)!; target.category = category; target.reviewed = true; })), s.reviewed !== false && s.category === category))}</View>
            {button(t(s.excluded ? 'Include segment' : 'Exclude segment'), () => void act(() => editShift(owner!, entry.data.client_id, e => { const target = e.data.segments.find(item => item.client_id === s.client_id)!; target.excluded = !target.excluded; })))}
            <Text>{t('Assign platform period')}</Text>
            <View style={styles.row}>{button(t('No platform'), () => void act(() => editShift(owner!, entry.data.client_id, e => { e.data.segments.find(item => item.client_id === s.client_id)!.platform_client_id = null; })), !s.platform_client_id)}
            {entry.data.platform_sessions.map(p => button(`${platformLabel(p.platform)} · ${date(p.started_at)}`, () => void act(() => editShift(owner!, entry.data.client_id, e => { e.data.segments.find(item => item.client_id === s.client_id)!.platform_client_id = p.client_id; })), s.platform_client_id === p.client_id, p.client_id))}</View>
            </>}
          </View>)}
          <Text>{t("Save Trips converts reviewed, included segments. Unsaved segments are processed after midnight when synchronization is available.")}</Text>
          {button(t('Save Trips'), () => void act(() => requestTripSave(owner!, entry.data.client_id)))}
        </View>}
        <Text style={styles.heading}>{t('Shift history')}</Text>
        {!entries.length && <Text>{t('No Shifts saved yet.')}</Text>}
        {[...entries].sort((a,b) => b.data.started_at.localeCompare(a.data.started_at)).map(e => button(`${date(e.data.started_at)} · ${t(e.data.ended_at ? 'Ended' : 'Active')}`, () => setSelected(e.data.client_id), entry?.data.client_id === e.data.client_id, e.data.client_id))}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, width: '100%', maxWidth: 760, alignSelf: 'center', paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', flexShrink: 1 }, heading: { fontSize: 19, fontWeight: '700', flexShrink: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { borderWidth: 1, borderColor: '#8094A8', borderRadius: 16, padding: 14, gap: 12 },
  button: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#8094A8', borderRadius: 12, justifyContent: 'center', maxWidth: '100%' },
  chosen: { backgroundColor: '#0072B5' }, input: { minHeight: 48, borderWidth: 1, borderColor: '#8094A8', borderRadius: 10, padding: 12 },
});
