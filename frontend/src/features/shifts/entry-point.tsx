import { router, type Href } from 'expo-router';
import { Pressable, Text } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { useShifts } from './context';
export function ShiftEntryPoint() {
  const { entries, owner } = useShifts(); const { t } = useLanguage();
  if (!owner) return null;
  const active = entries.some(e => e.local && !e.data.ended_at);
  return <Pressable onPress={() => router.push('/shifts' as Href)} accessibilityRole="button" style={{ minHeight: 48, padding: 12, alignSelf: 'center' }}>
    <Text style={{ fontWeight: '700', color: '#0072B5' }}>{t(active ? 'Shift in progress' : 'Shifts · Start Shift')}</Text>
  </Pressable>;
}
