import { useEffect, useState } from 'react';
import { ReportControls } from '@/features/reports/components/ReportControls';
import { useLanguage, Translated } from '@/i18n/language';
import { ScrollView, Text, View, SafeAreaView, Pressable } from '@/theme/components';
import { AppState, StyleSheet } from 'react-native';
import { useCurrentReport } from '@/features/reports/hooks/use-current-report';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { formatReportDate, getCurrentMonthAndYear } from '@/features/reports/utils/date';
import { ReportBody } from '@/features/reports/components/ReportBody';
import { ReportLoadState } from '@/features/reports/components/ReportPresentation';
import PremiumButton from '@/components/ui/PremiumButton';
import { useMonthlyGoal } from '@/features/users/hooks/use-monthly-goal';
import { useIsTablet } from '@/hooks/use-is-tablet';

export default function FreeTierReportScreen() {
  const { locale, t } = useLanguage();
  const profile = useCurrentUser();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 60_000);
    const app = AppState.addEventListener('change', state => { if (state === 'active') update(); });
    return () => { clearInterval(timer); app.remove(); };
  }, []);
  const current = getCurrentMonthAndYear(profile.data?.timezone ?? 'America/New_York', new Date(now));
  const [method, setMethod] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const isTablet = useIsTablet();
  const { data, isLoading, isError, isPlaceholderData, refetch } = useCurrentReport({ year: current.year, month: current.month, method: method || undefined }, { enabled: !!profile.data });
  const { data: monthlyGoal } = useMonthlyGoal();
  const { year, month } = current;
  const waitingForProfile = !profile.data && !profile.isError;
  return <SafeAreaView edges={['top']} style={s.screen}>
    <ScrollView contentContainerStyle={[s.content, isTablet && s.tablet]} showsVerticalScrollIndicator={false}>
      <View style={s.inner}>
        <Text accessibilityRole="header" style={s.title}><Translated text="Reports" /></Text>
        <Text style={s.period}>{formatReportDate(year, month, undefined, locale)} {t('· Month to date')}</Text>
        <Text style={{ color: '#64748B', lineHeight: 21 }}>{t('Your free report includes this month and a comparison with last month.')}</Text>
        {waitingForProfile || isLoading || isPlaceholderData || isError || !data ? <ReportLoadState loading={waitingForProfile || isLoading || isPlaceholderData} retry={() => { if (!profile.data) void profile.refetch(); else void refetch(); }} /> : <ReportBody report={data} />}
        {monthlyGoal && monthlyGoal.goal > 0 && <View style={s.goal}>
          <Text>{t('Monthly income goal')}</Text><Text style={s.goalValue}>{new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(monthlyGoal.current)} / {new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(monthlyGoal.goal)}</Text>
        </View>}
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showPreferences }} onPress={() => setShowPreferences(!showPreferences)} style={s.preferences}><Text style={s.preferenceTitle}>{t('Reporting preferences')} {showPreferences ? '−' : '+'}</Text></Pressable>
        {showPreferences && <ReportControls year={year} premium={false} vehicleId={vehicleId} onVehicle={setVehicleId} method={method} onMethod={setMethod} />}
        <PremiumButton title="Put your numbers to work." message="Review past months, choose custom dates, and export your reports." features={['Access past months and years', 'Choose the dates that matter to you', 'Export reports as PDF or CSV']} />
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
