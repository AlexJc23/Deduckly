import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Pressable, SafeAreaView } from '@/theme/components';
import { Ionicons } from '@/theme/icons';
import { router } from 'expo-router';
import { useLanguage } from '@/i18n/language';

type Props = { title?: string; safeArea?: boolean; onBack?: () => void; right?: ReactNode };

/** Shared page navigation; content owns its remaining safe-area edges. */
export function ScreenHeader({ title, safeArea = true, onBack, right }: Props) {
  const { t } = useLanguage();
  const row = <View style={styles.row}>
    <View style={[styles.side, right != null && styles.wide]}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Back')} hitSlop={8}
        onPress={onBack ?? (() => router.back())} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color="#0072B5" />
      </Pressable>
    </View>
    <Text accessibilityRole="header" style={styles.title}>{title ? t(title) : ''}</Text>
    <View style={[styles.side, styles.right, right != null && styles.wide]}>{right}</View>
  </View>;
  return safeArea ? <SafeAreaView edges={['top', 'left', 'right']}>{row}</SafeAreaView> : row;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, minHeight: 56 },
  side: { width: 44, minHeight: 44, justifyContent: 'center' },
  wide: { width: 84 },
  right: { alignItems: 'flex-end' },
  back: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
});
