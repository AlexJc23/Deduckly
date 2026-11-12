import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAdaptiveLayout } from '@/hooks/use-adaptive-layout';
import { useLanguage } from '@/i18n/language';
import { Pressable, SafeAreaView, ScrollView, Text, View } from '@/theme/components';
import { Ionicons } from '@/theme/icons';

export function RecordDetailsScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={title} safeArea={false} />
      {children}
    </SafeAreaView>
  );
}

export function RecordDetailsStatus({ loading, message, retry, retrying }: {
  loading: boolean; message: string; retry?: () => void; retrying?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <ScrollView contentContainerStyle={styles.status}>
      {loading ? <ActivityIndicator accessibilityLabel={t('Loading')} /> : <>
        <Text accessibilityRole="alert" style={styles.muted}>{t(message)}</Text>
        {retry && <View><RecordAction label="Try again" icon="refresh-outline" onPress={retry} disabled={retrying} /></View>}
      </>}
    </ScrollView>
  );
}

export function RecordDetails({ summary, fields, aside, actions }: {
  summary: ReactNode; fields: ReactNode; aside?: ReactNode; actions: ReactNode;
}) {
  const { availableWidth, fontScale } = useAdaptiveLayout();
  const columns = aside != null && availableWidth >= 680 * Math.max(1, fontScale);
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={[styles.content, columns && styles.wideContent]}>
        <View style={[styles.sections, columns && styles.columns]}>
          <View style={[styles.card, columns && styles.column]}>
            {summary}
            <View style={styles.fields}>{fields}</View>
          </View>
          {aside != null && <View style={[styles.card, columns && styles.column]}>{aside}</View>}
        </View>
        <View style={[styles.sections, columns && styles.columns]}>{actions}</View>
      </View>
    </ScrollView>
  );
}

export function RecordAmount({ value, kind }: { value: number | string; kind: 'income' | 'expense' }) {
  const { locale, t } = useLanguage();
  const income = kind === 'income';
  const formatted = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(Number(value));
  return (
    <View style={styles.amountBlock}>
      <View style={[styles.icon, income && styles.incomeIcon]}>
        <Ionicons name={income ? 'arrow-down-outline' : 'receipt-outline'} size={22} color={income ? '#15803D' : '#0072B5'} />
      </View>
      <View style={styles.amountContent}>
        <Text style={styles.muted}>{t('Amount')}</Text>
        <Text selectable style={[styles.amount, income && styles.incomeAmount]}>{formatted}</Text>
      </View>
    </View>
  );
}

export function RecordField({ label, value, leading, section }: {
  label: string; value: string; leading?: ReactNode; section?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <View style={styles.field}>
      <Text accessibilityRole={section ? 'header' : undefined} style={section ? styles.sectionTitle : styles.muted}>{t(label)}</Text>
      <View style={styles.fieldValue}>
        {leading}
        <Text selectable style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

export function RecordAction({ label, icon, onPress, destructive, disabled }: {
  label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; destructive?: boolean; disabled?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.action, destructive && styles.destructive, (pressed || disabled) && styles.dimmed]}>
      <Ionicons name={icon} size={18} color={destructive ? '#DC2626' : '#FFFFFF'} />
      <Text style={[styles.actionText, destructive && styles.destructiveText]}>{t(label)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  status: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 12 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 16 },
  wideContent: { maxWidth: 880 },
  sections: { gap: 12 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  column: { flex: 1, minWidth: 0 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  amountBlock: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12, gap: 12, flexDirection: 'row', alignItems: 'center' },
  amountContent: { flex: 1, minWidth: 0, gap: 2 },
  icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#DCE6FF', alignItems: 'center', justifyContent: 'center' },
  incomeIcon: { backgroundColor: '#DCFCE7' },
  amount: { fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },
  incomeAmount: { color: '#15803D' },
  fields: { gap: 12 },
  field: { gap: 4 },
  fieldValue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muted: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  value: { flex: 1, minWidth: 0, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  action: { minHeight: 48, flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#4A6FE3' },
  destructive: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FECACA' },
  dimmed: { opacity: 0.75 },
  actionText: { flexShrink: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  destructiveText: { color: '#B91C1C' },
});
