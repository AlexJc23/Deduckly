import { StyleSheet } from 'react-native';
import { View, Text, TextInput, Pressable } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
export function Field({ label, value, onChange, numeric = false }: { label: string; value: string; onChange: (s: string) => void; numeric?: boolean }) {
  const { t } = useLanguage();
  return <View style={{ gap: 6 }}><Text>{t(label)}</Text><TextInput accessibilityLabel={t(label)} value={value}
    onChangeText={s => onChange(numeric ? s.replace(',', '.') : s)} keyboardType={numeric ? 'decimal-pad' : 'default'}
    style={styles.input} /></View>;
}
export function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  const { t } = useLanguage();
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, disabled && { opacity: .45 }]}><Text style={{ color: '#FFFFFF', fontWeight: '700', textAlign: 'center' }}>{t(title)}</Text></Pressable>;
}
export const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 60, gap: 18, width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { padding: 18, gap: 14, borderWidth: 1, borderColor: '#94A3B8', borderRadius: 18, width: '100%' },
  title: { fontSize: 24, fontWeight: '800' },
  input: { borderWidth: 1, borderColor: '#94A3B8', borderRadius: 10, minHeight: 48, padding: 12 },
  button: { backgroundColor: '#4267D9', minHeight: 48, padding: 14, borderRadius: 12, justifyContent: 'center' },
});
