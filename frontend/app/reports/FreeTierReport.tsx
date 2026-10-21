import { useState } from 'react';
import { CompactSelect } from '@/components/ui/CompactSelect';
import { ReportControls } from '@/features/reports/components/ReportControls';
import { useLanguage, Translated } from '@/i18n/language';
import { ScrollView, Text, View, SafeAreaView, Pressable } from '@/theme/components';
import { StyleSheet } from 'react-native';
import { useCurrentReport } from '@/features/reports/hooks/use-current-report';
import { formatReportDate, getCurrentMonthAndYear } from '@/features/reports/utils/date';
import { ReportBody } from '@/features/reports/components/ReportBody';
import { ReportLoadState } from '@/features/reports/components/ReportPresentation';
import PremiumButton from '@/components/ui/PremiumButton';
import { useMonthlyGoal } from '@/features/users/hooks/use-monthly-goal';
import { useIsTablet } from '@/hooks/use-is-tablet';

export default function FreeTierReportScreen() {
  const { locale, t } = useLanguage();
  const current = getCurrentMonthAndYear();
  const [month, setMonth] = useState(current.month);
  const [year, setYear] = useState(current.year);
  const [method, setMethod] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const isTablet = useIsTablet();
  const { data, isLoading, isError, isPlaceholderData, refetch } = useCurrentReport({ year, month, method: method || undefined });
  const { data: monthlyGoal } = useMonthlyGoal();
  const currentPeriod = month === current.month && year === current.year;
  return <SafeAreaView edges={['top']} style={s.screen}>
    <ScrollView contentContainerStyle={[s.content, isTablet && s.tablet]} showsVerticalScrollIndicator={false}>
      <View style={s.inner}>
        <Text accessibilityRole="header" style={s.title}><Translated text="Reports" /></Text>
        <Text style={s.period}>{formatReportDate(year, month, undefined, locale)} {t(currentPeriod ? '· Month to date' : '· Selected period')}</Text>
        <View style={s.selectors}>
          <View style={s.month}><CompactSelect label={t('Month')} value={String(month)} choices={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(year, i, 1).toLocaleDateString(locale, { month: 'long' }) }))} onChange={m => setMonth(Number(m))} /></View>
          <View style={s.year}><CompactSelect label={t('Year')} value={String(year)} choices={Array.from({ length: current.year - 2009 }, (_, i) => ({ value: String(current.year - i), label: String(current.year - i) }))} onChange={y => setYear(Number(y))} /></View>
        </View>
        {isLoading || isPlaceholderData || isError || !data ? <ReportLoadState loading={isLoading || isPlaceholderData} retry={() => void refetch()} /> : <ReportBody report={data} />}
        {currentPeriod && monthlyGoal && monthlyGoal.goal > 0 && <View style={s.goal}>
          <Text>{t('Monthly income goal')}</Text><Text style={s.goalValue}>{new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(monthlyGoal.current)} / {new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(monthlyGoal.goal)}</Text>
        </View>}
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showPreferences }} onPress={() => setShowPreferences(!showPreferences)} style={s.preferences}><Text style={s.preferenceTitle}>{t('Reporting preferences')} {showPreferences ? '−' : '+'}</Text></Pressable>
        {showPreferences && <ReportControls year={year} premium={false} vehicleId={vehicleId} onVehicle={setVehicleId} method={method} onMethod={setMethod} />}
        <PremiumButton title="Put your numbers to work." message="Explore custom dates and save or share detailed reports." features={['Choose the dates that matter to you', 'Export reports as PDF or CSV']} />
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FB' }, content: { padding: 16, paddingBottom: 32 }, tablet: { padding: 24 },
  inner: { width: '100%', maxWidth: 1000, alignSelf: 'center', gap: 14 }, title: { fontSize: 28, fontWeight: '700', color: '#273449' },
  period: { color: '#0072B5', fontSize: 16, fontWeight: '600' }, selectors: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, month: { flex: 2, minWidth: 140 }, year: { flex: 1, minWidth: 90 },
  goal: { padding: 14, gap: 8, borderRadius: 14, backgroundColor: '#FFFFFF' }, goalValue: { fontWeight: '600' }, preferences: { minHeight: 48, justifyContent: 'center' }, preferenceTitle: { color: '#0072B5', fontWeight: '600' },
});
