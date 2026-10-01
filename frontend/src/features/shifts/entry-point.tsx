import { useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import { Pressable, Text } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { useShifts } from './context';
export function ShiftEntryPoint({ manualActive = false }: { manualActive?: boolean }) {
  const { entries, owner } = useShifts(); const { t, locale } = useLanguage();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(timer); }, []);
  if (!owner) return null;
  const active = entries.find(e => e.local && !e.data.ended_at);
  const driving = active?.detector.driving && !manualActive;
  const platform = active?.data.platform_sessions.find(p => !p.ended_at)?.platform;
  return <Pressable onPress={() => router.push('/shifts' as Href)} accessibilityRole="button" style={{ minHeight: 100, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#8094A8', gap: 8 }}>
    <Text style={{ fontWeight: '700', fontSize: 20 }}>{t(driving ? 'Trip in Progress' : active ? 'Shift in progress' : 'Start Shift')}</Text>
    {active && <><Text>{t('Elapsed minutes')}: {Math.max(0, Math.floor((now-Date.parse(active.data.started_at))/60000))}{platform ? ` · ${platform.replace(/_/g, ' ')}` : ''}</Text>
      {driving && <Text>{active.detector.miles.toFixed(2)} {t('miles')} · {t('Shift Active')}</Text>}
      {active.data.planned_end_at && <Text>{t('Planned end')}: {new Date(active.data.planned_end_at).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}</Text>}</>}
    <Text>{t('Open Shift Mode')}</Text>
  </Pressable>;
}
