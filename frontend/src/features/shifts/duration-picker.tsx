import { useState } from 'react';
import { Modal, Platform, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Pressable, Text } from '@/theme/components';
import { useAppTheme } from '@/theme/theme';
import { useLanguage } from '@/i18n/language';
import { SHIFT_DURATIONS } from './duration';
export function DurationPicker({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const { t } = useLanguage(); const { dark } = useAppTheme(); const [open, setOpen] = useState(false);
  const label = (m: number) => !m ? t('No planned end') : m < 60 ? t('{minutes} min', { minutes: m }) : m % 60 ? t('{hours} hr {minutes} min', { hours: Math.floor(m / 60), minutes: m % 60 }) : t('{hours} hr', { hours: m / 60 });
  const picker = <Picker accessibilityLabel={t('Planned duration')} selectedValue={value} onValueChange={v => onChange(Number(v))} style={{ color: dark ? '#EDF3FA' : '#273449', width: '100%' }}>{SHIFT_DURATIONS.map(m => <Picker.Item key={m} label={label(m)} value={m} />)}</Picker>;
  if (Platform.OS !== 'ios') return picker;
  return <><Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={{ minHeight: 48, padding: 12, borderWidth: 1, borderColor: '#8094A8', borderRadius: 12 }}><Text>{label(value)}</Text></Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008', padding: 24 }}><View style={{ width: '100%', maxWidth: 500, borderRadius: 20, padding: 20, backgroundColor: dark ? '#101722' : '#F8FAFC' }}><Text>{t('Planned duration')}</Text>{picker}<Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={{ minHeight: 48, padding: 14 }}><Text>{t('Done')}</Text></Pressable></View></View></Modal>
  </>;
}
