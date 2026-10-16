import { PlatformTiles } from '@/components/ui/PlatformTiles';
import { CompactSelect } from '@/components/ui/CompactSelect';
import { elapsedMinutes, platformName, shiftMiles } from '@/features/shifts/presentation';
import { DurationPicker } from '@/features/shifts/duration-picker';
import { plannedEndAt } from '@/features/shifts/duration';
import { requestShiftNotifications } from '@/features/shifts/notifications';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, Pressable, ScrollView, SafeAreaView } from '@/theme/components';
import { useAppTheme } from '@/theme/theme';
import { useLanguage } from '@/i18n/language';
import { useShifts } from '@/features/shifts/context';
import { editShift, switchPlatform, requestTripSave } from '@/features/shifts/journal';
import { startShiftRecording, endShiftRecording, getRecordingMode, subscribeToRecording } from '@/features/tracking/services/background-tracking';
export default function ShiftsScreen() {
  const { owner, entries, syncError, sync } = useShifts();
  const { t, locale } = useLanguage(); const { dark } = useAppTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const [selected, setSelected] = useState<string | null>(params.id ?? null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false); const [showEnd, setShowEnd] = useState(false);
  const [minutes, setMinutes] = useState(0); const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now()); const [mode, setMode] = useState(getRecordingMode());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); const off = subscribeToRecording(() => setMode(getRecordingMode())); return () => { clearInterval(timer); off(); }; }, []);
  useEffect(() => { setSelected(null); setShowEnd(false); setShowHistory(false); }, [owner]);
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
  const platformLabel = (value: string) => t(platformName(value));
  const date = (value: string) => new Date(value).toLocaleString(locale);
  function button(label: string, fn: () => void, chosen = false, key = label) {
    return <Pressable key={key} disabled={busy || !owner} onPress={fn} accessibilityRole="button" accessibilityState={{ disabled: busy || !owner, selected: chosen }} style={[styles.button, chosen && styles.chosen, [t('Start Shift'), t('Save Trips')].includes(label) && styles.primary, label === t('End Shift') && styles.destructive]}><Text style={{ color: chosen || [t('Start Shift'), t('Save Trips')].includes(label) ? '#FFFFFF' : label === t('End Shift') ? '#DC2626' : foreground }}>{label}</Text></Pressable>;
  }
  function platformButtons(fn: (p: string | null) => void, current: string | null) {
    return <PlatformTiles value={current} onChange={fn} disabled={busy || !owner} />;
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: dark ? '#101722' : '#F8FAFC' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.navigation}><Pressable accessibilityRole="button" accessibilityLabel={t('Back')} onPress={() => router.back()} style={styles.navAction}><Text style={{ color: '#4A6FE3' }}>‹ {t('Back')}</Text></Pressable><Text accessibilityRole="header" style={styles.title}>{t('Shift Mode')}</Text><Pressable accessibilityRole="button" disabled={busy || !owner} onPress={() => { setBusy(true); void sync().finally(() => setBusy(false)); }} style={styles.navAction}><Text style={{ color: '#4A6FE3' }}>{t('Sync now')}</Text></Pressable></View>
        {!owner && <Text>{t('Sign in to manage Shifts.')}</Text>}
        {syncError && <Text accessibilityRole="alert">{t('Sync needs attention. Data is saved locally; a server conflict may need review.')}</Text>}
        {!active && <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.heading}>{t('Start a Shift')}</Text><Text style={styles.muted}>{t('Automatic drive detection while you work.')}</Text>
          {platformButtons(setPlatform, platform)}
          <Text>{t('End in (optional)')}</Text>
          <DurationPicker value={minutes} onChange={setMinutes} />
          {button(t('Start Shift'), () => void act(async () => {
            if (!await startShiftRecording(owner!, platform, planned())) throw Error('Location unavailable');
            setSelected(null);
            if (minutes) await requestShiftNotifications();
          }))}
        </View>}
        {active && entry !== active && button(t('View active Shift'), () => setSelected(active.data.client_id))}
        {entry && <View style={{gap:16}}>
          <View style={[styles.card,!entry.data.ended_at && {backgroundColor:'#F0FDF4',borderColor:'#32634F'}]}>
          <Text style={styles.heading}>{t(entry.data.ended_at ? 'Shift summary' : entry.detector.driving ? 'Driving' : 'Shift Active')}</Text>
          <Text>{date(entry.data.started_at)}</Text>
          <Text style={styles.heading}>{t(platformName(entry.data.ended_at ? entry.data.platform_sessions.at(-1)?.platform : entry.data.platform_sessions.find(p => !p.ended_at)?.platform))}</Text><View style={styles.row}><Text>{t('{hours}h {minutes}m elapsed', { hours: Math.floor(elapsedMinutes(entry.data.started_at, entry.data.ended_at, now)/60), minutes: elapsedMinutes(entry.data.started_at, entry.data.ended_at, now)%60 })}</Text><Text>· {t('{miles} miles detected', { miles: shiftMiles(entry).toFixed(2) })}</Text></View>
          {(entry.dirty || entry.pending) && <Text style={styles.muted}>{t('Pending sync')}</Text>}
          {!entry.data.ended_at && entry.local && <>{button(t('End Shift'), () => Alert.alert(t('End Shift?'), t(entry.detector.driving ? 'A drive is active. End Shift will finish it now. Continue?' : 'Saved segments will remain available for review.'), [{ text: t('Cancel'), style: 'cancel' }, { text: t('End Shift'), style: 'destructive', onPress: () => void act(() => endShiftRecording(owner!, entry.data.client_id)) }]))}</>}
          </View>
          {!entry.data.ended_at && <>
            {(!entry.local || mode !== 'background') && <Text accessibilityRole="alert">{t(!entry.local ? 'This Shift was started on another device.' : mode === 'foreground' ? 'Keep the app open to record mileage.' : 'Recording paused. Check location access and reopen the app.')}</Text>}
            {entry.local && <View style={styles.card}><Text style={styles.heading}>{t('Platform')}</Text>{platformButtons(p => void act(async () => { await switchPlatform(owner!, entry.data.client_id, p); }), entry.data.platform_sessions.find(p => !p.ended_at)?.platform ?? null)}
</View>}

<View style={styles.card}><Text style={styles.heading}>{t('Planned End Time (optional)')}</Text>
            {entry.data.planned_end_at && <Text>{t('Planned end')}: {date(entry.data.planned_end_at)}{now > Date.parse(entry.data.planned_end_at) ? ` · ${t('Planned end reached; waiting for the current drive to finish.')}` : ''}</Text>}
            {button(t('Change planned end'), () => setShowEnd(!showEnd))}
            {showEnd && <><Text>{t('End in (optional)')}</Text>
            <DurationPicker value={minutes} onChange={setMinutes} />
            {button(t('Update planned end'), () => void act(async () => { await editShift(owner!, entry.data.client_id, e => { e.data.planned_end_at = planned(); }); if (minutes) await requestShiftNotifications(); setShowEnd(false); }))}</>}
</View>
          </>}
          <View style={styles.card}><Pressable accessibilityRole="button" accessibilityState={{ expanded: showHistory }} onPress={() => setShowHistory(!showHistory)} style={styles.navAction}><Text style={styles.muted}>{t('Platform history')} {showHistory ? '−' : '+'}</Text></Pressable>
          {showHistory && entry.data.platform_sessions.map(p => <Text key={p.client_id} style={styles.muted}>{platformLabel(p.platform)} · {date(p.started_at)} — {p.ended_at ? date(p.ended_at) : t('Active')}</Text>)}
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
            <View style={styles.row}>{(['business', 'personal'] as const).map(category => button(t(category === 'business' ? 'Business' : 'Personal'), () => void act(() => editShift(owner!, entry.data.client_id, e => { const target = e.data.segments.find(item => item.client_id === s.client_id)!; target.category = category; target.reviewed = true; })), s.category === category))}</View>
            {button(t(s.excluded ? 'Include segment' : 'Exclude segment'), () => void act(() => editShift(owner!, entry.data.client_id, e => { const target = e.data.segments.find(item => item.client_id === s.client_id)!; target.excluded = !target.excluded; })))}
            <CompactSelect label="Assign platform period" value={s.platform_client_id ?? ''} choices={[{ value: '', label: t('No platform') }, ...entry.data.platform_sessions.map(p => ({ value: p.client_id, label: `${platformLabel(p.platform)} · ${date(p.started_at)}` }))]} disabled={busy || !owner} onChange={period => void act(() => editShift(owner!, entry.data.client_id, e => { e.data.segments.find(item => item.client_id === s.client_id)!.platform_client_id = period || null; }))} />
            </>}
          </View>)}
          <Text>{t("Save Trips converts reviewed, included segments. Unsaved segments are processed after midnight when synchronization is available.")}</Text>
          {button(t('Save Trips'), () => void act(() => requestTripSave(owner!, entry.data.client_id)))}
          </View>
        </View>}
        <Text style={styles.heading}>{t('Shift history')}</Text>
        {!entries.length && <Text>{t('No Shifts saved yet.')}</Text>}
        {[...entries].sort((a,b) => b.data.started_at.localeCompare(a.data.started_at)).map(e => button(`${date(e.data.started_at)} · ${t(e.data.ended_at ? 'Ended' : 'Active')}\n${t('{minutes} min', { minutes: elapsedMinutes(e.data.started_at,e.data.ended_at,now) })} · ${shiftMiles(e).toFixed(2)} ${t('miles')}`, () => setSelected(e.data.client_id), entry?.data.client_id === e.data.client_id, e.data.client_id))}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, width: '100%', maxWidth: 760, alignSelf: 'center', paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', flexShrink: 1 }, heading: { fontSize: 19, fontWeight: '700', flexShrink: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, gap: 12 },
  button: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, justifyContent: 'center', maxWidth: '100%' },
  navigation: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  navAction: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 4 },
  muted: { color: '#64748B', fontSize: 14 }, primary: { backgroundColor: '#4A6FE3', borderColor: '#4A6FE3', alignItems: 'center' },
  destructive: { backgroundColor: '#FFF5F5', borderColor: '#DC2626', alignItems: 'center' },
  chosen: { backgroundColor: '#4A6FE3' }, input: { minHeight: 48, borderWidth: 1, borderColor: '#8094A8', borderRadius: 10, padding: 12 },
});
