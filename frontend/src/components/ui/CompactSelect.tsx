import { useState } from 'react';
import { Modal, StyleSheet } from 'react-native';
import { View, Text, Pressable, ScrollView, SafeAreaView } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
export function CompactSelect({ label, value, choices, onChange, disabled = false }: {
 label: string; value: string; choices: { value: string; label: string }[]; onChange: (value: string) => void; disabled?: boolean;
}) {
 const { t } = useLanguage(); const [open, setOpen] = useState(false);
 const selected = choices.find(c => c.value === value)?.label ?? value;
 return <>
  <Pressable accessibilityRole="button" accessibilityLabel={`${t(label)}: ${selected}`} accessibilityState={{ disabled, expanded: open }} disabled={disabled} onPress={() => setOpen(true)} style={[s.control, disabled && { opacity: .5 }]}>
   <Text style={s.caption}>{t(label)}</Text><Text style={s.value}>{selected} ▾</Text>
  </Pressable>
  <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
   <View style={s.overlay}><SafeAreaView style={s.sheet} accessibilityViewIsModal>
    <Text accessibilityRole="header" style={s.heading}>{t(label)}</Text>
    <ScrollView>{choices.map(c => <Pressable key={c.value} accessibilityRole="button" accessibilityState={{ selected: c.value === value }} onPress={() => { setOpen(false); onChange(c.value); }} style={s.choice}>
     <Text style={{ flex: 1 }}>{c.label}</Text>{c.value === value && <Text style={{ color: '#4A6FE3' }}>✓</Text>}
    </Pressable>)}</ScrollView>
    <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={s.choice}><Text style={{ color: '#4A6FE3', fontWeight: '700' }}>{t('Cancel')}</Text></Pressable>
   </SafeAreaView></View>
  </Modal>
 </>;
}
const s = StyleSheet.create({
 control: { minHeight: 48, borderRadius: 12, padding: 12, backgroundColor: '#F1F5F9', gap: 3 },
 caption: { fontSize: 12, color: '#64748B' }, value: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
 overlay: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008' },
 sheet: { width: '100%', maxWidth: 500, maxHeight: '85%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16 },
 heading: { fontSize: 20, fontWeight: '700', padding: 12 }, choice: { minHeight: 48, padding: 14, flexDirection: 'row', gap: 12 },
});
