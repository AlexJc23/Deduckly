import type { ReactNode } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useAdaptiveLayout } from '@/hooks/use-adaptive-layout';
import { SafeAreaView, ScrollView, View } from '@/theme/components';

export function RecordFormLayout({ main, aside, actions }: {
  main: ReactNode;
  aside: ReactNode;
  actions: ReactNode;
}) {
  const { availableWidth, fontScale } = useAdaptiveLayout();
  const wide = availableWidth >= 680 * Math.max(1, fontScale);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, wide && styles.wideContent]}>
          <View style={[styles.sections, wide && styles.columns]}>
            <View style={[styles.column, wide && styles.main]}>{main}</View>
            <View style={[styles.column, wide && styles.aside]}>{aside}</View>
          </View>
          {actions}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export const recordFormStyles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 18, padding: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 16 },
  wideContent: { maxWidth: 880 },
  sections: { gap: 12 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  column: { minWidth: 0, gap: 12 },
  main: { flex: 3 },
  aside: { flex: 2 },
});
