import { dashboardLayout } from '@/features/reports/utils/dashboard-layout';
import { dashboardType } from '@/theme/typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { localizedAlert } from '@/i18n/alerts';
import { useLanguage } from '@/i18n/language';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { StartTripModal } from '@/features/tracking/components/StartTripModal';
import { useTracking } from '@/features/tracking/context/tracking.context';
import { useDailyGoal } from '@/features/users/hooks/use-daily-goal';
import { useTodayReport } from '@/features/reports/hooks/use-today-report';
import { dashboardSummary } from '@/features/reports/utils/dashboard-summary';
import { ShiftEntryPoint } from '@/features/shifts/entry-point';
import { useShifts } from '@/features/shifts/context';
import { elapsedMinutes, platformName } from '@/features/shifts/presentation';
import { getPendingTrip } from '@/services/siri.service';
import { View, Text, Pressable, SafeAreaView, ScrollView } from '@/theme/components';
import { Ionicons } from '@/theme/icons';
import { useAppTheme } from '@/theme/theme';

export default function DashboardScreen() {
  const { dark } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  const [availableWidth, setAvailableWidth] = useState(0);
  const [availableHeight,setAvailableHeight]=useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  // Content grows to the viewport, but may exceed it when text or controls need more room.
  const overflow = availableHeight > 0 && contentHeight > availableHeight + 1;
  const compact = fontScale <= 1.2;
  const tablet = Platform.OS === 'ios' ? Platform.isPad : width >= 768;
  const grid = tablet && availableWidth >= 680 && fontScale <= 1.3;
  const { t, locale } = useLanguage();
  const userQuery = useCurrentUser();
  const { saved } = useLocalSearchParams();
  const { isTracking, isReady, trackingNotice, startTrackingFromSiri } = useTracking();
  const { entries } = useShifts();
  const report = useTodayReport();
  const { data: dailyGoal } = useDailyGoal();

  const [showStartTripModal, setShowStartTripModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [now, setNow] = useState(Date.now());
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openStartModal = useCallback(() => setShowStartTripModal(true), []);
  const closeStartModal = useCallback(() => setShowStartTripModal(false), []);

  useEffect(() => {
    if (saved !== 'true') return;

    setShowBanner(true);

    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }

    bannerTimeoutRef.current = setTimeout(() => {
      setShowBanner(false);
      bannerTimeoutRef.current = null;
    }, 3000);

    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current);
      }
    };
  }, [saved]);

  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(async () => {
      const pendingTrip = await getPendingTrip();
      if (!pendingTrip) return;

      clearInterval(interval);

      if (!(await startTrackingFromSiri(pendingTrip.platform))) return;
      router.replace('/tracking/active');
    }, 500);

    return () => clearInterval(interval);
  }, [isReady, startTrackingFromSiri]);

  const summary = dashboardSummary(report.data, dailyGoal);
  const money = (amount: number | null) =>
    amount === null
      ? '—'
      : new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount);
  const hour = new Date().getHours();
  const greeting = t(hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');
  const activeShift = entries.find((entry) => entry.local && !entry.data.ended_at);
  const active = !!activeShift;

  useEffect(() => {
    if (!active) return;

    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, [active]);

  const shiftMinutes = activeShift
    ? elapsedMinutes(activeShift.data.started_at, null, now)
    : null;


  const layout = dashboardLayout(availableHeight, active);
  const supporting = !compact || layout.showSupportingText;
  const actionStyle = compact ? { minHeight: layout.actionHeight, paddingHorizontal: layout.padding, paddingVertical: 8 + 6 * layout.density } : undefined;
  const iconStyle = compact ? { width: layout.iconSize, height: layout.iconSize } : undefined;
  const shiftAction = <><ShiftEntryPoint manualActive={isTracking} activeOnly compact />

        {!active && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Start Shift')}
            onPress={() => router.push('/shifts')}
            style={[s.shiftButton,actionStyle]}
          >
            <View style={[s.shiftIcon, iconStyle]}>
              <Ionicons name="briefcase-outline" size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.primaryTitle}>{t('Start Shift')}</Text>
              {supporting && <Text style={s.shiftHint}>{t('Track automatically while you work')}</Text>}
            </View>
            <View style={s.arrow}>
              <Ionicons name="arrow-forward" size={23} color="#FFFFFF" />
            </View>
          </Pressable>
        )}</>;
  const tripAction = <Pressable
          accessibilityRole="button"
          disabled={!isReady}
          accessibilityHint={t(isTracking ? 'View active trip' : 'Or say “Siri, Start a trip in Deduckly”')}
          accessibilityState={{ disabled: !isReady }}
          onPress={() => isTracking ? router.push('/tracking/active') : openStartModal()}
          style={[s.primary,actionStyle, !isReady && { opacity: 0.5 }]}
        >
          <View style={[s.tripIcon, iconStyle]}>
            <Ionicons name={isTracking ? 'navigate' : 'play'} color="#0072B5" size={27} />
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={s.tripTitle}>{t(isTracking ? 'Trip in Progress' : 'Start a Trip')}</Text>
            {supporting && <Text style={s.primaryHint}>
              {t(isTracking ? 'View active trip' : 'Or say “Siri, Start a trip in Deduckly”')}
            </Text>}
          </View>
          <Ionicons name="chevron-forward" size={21} color="#94A3B8" />
        </Pressable>;
  const quickActions = <View style={s.quick}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/income/create')}
            style={[s.quickButton,compact && { minHeight: Math.max(48, layout.actionHeight - 12), paddingHorizontal: layout.padding, paddingVertical: 8 + 6 * layout.density }]}
          >
            <Ionicons name="add-circle-outline" size={23} color="#50C7EF" />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.quickTitle}>{t('Add Income')}</Text>
              {supporting && <Text style={s.quickHint}>{t('Track your earnings')}</Text>}
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/expense/create')}
            style={[s.quickButton,compact && { minHeight: Math.max(48, layout.actionHeight - 12), paddingHorizontal: layout.padding, paddingVertical: 8 + 6 * layout.density }]}
          >
            <Ionicons name="receipt-outline" size={23} color="#50C7EF" />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.quickTitle}>{t('Add Expense')}</Text>
              {supporting && <Text style={s.quickHint}>{t('Record an expense')}</Text>}
            </View>
          </Pressable>
        </View>;
  const offerAction = <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/offer-analyzer/screens/OfferAnalyzerScreen')}
          style={[s.card, s.navigation,actionStyle]}
        >
          <View style={[s.icon, iconStyle]}>
            <Ionicons name="analytics-outline" size={27} color="#50C7EF" />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.heading}>{t('Offer Analyzer')}</Text>
            {supporting && <Text style={s.muted}>{t('Is that offer worth it?')}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
        </Pressable>;

  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <ScrollView
        style={s.viewport}
        onContentSizeChange={(_, height) => setContentHeight(height)}
        scrollEnabled={overflow}
        bounces={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        testID={compact ? "dashboard-compact" : "dashboard-comfortable"}
        onLayout={event => {
          setAvailableWidth(event.nativeEvent.layout.width);
          setAvailableHeight(event.nativeEvent.layout.height);
        }}
        contentContainerStyle={[s.content, tablet && s.tabletContent, compact && { gap: layout.gap, paddingTop: 4, paddingBottom: 12 }]}
      >
        <View style={[s.header,compact&&s.compactHeader]}>
          <View style={s.greetingGroup}>
            <Text style={s.greeting}>{greeting},</Text>
            {userQuery.data?.first_name && (
              <Text accessibilityRole="header" style={[s.name,compact && { fontSize: layout.nameSize, lineHeight: layout.nameSize * 1.2 }]}>
                {userQuery.data.first_name}!
              </Text>
            )}
            {supporting && <Text style={s.greeting}>{t('Ready to hit the road?')}</Text>}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Profile')}
            onPress={() => router.push('/settings/edit-profile')}
            style={s.profile}
          >
            <Ionicons name="person-outline" size={27} color="#50C7EF" />
          </Pressable>
        </View>

        {showBanner && (
          <Text accessibilityLiveRegion="polite" style={s.success}>
            {t('Trip Saved Successfully')}
          </Text>
        )}
        {report.isError && (
          <Pressable
            accessibilityRole="button"
            onPress={() => void report.refetch()}
            style={s.card}
          >
            <Text>{t('Could not refresh today’s data. Tap to retry.')}</Text>
          </Pressable>
        )}

        <View style={[s.card, s.earningsCard,compact && { padding: layout.padding, gap: 6 + 6 * layout.density }, dark && { backgroundColor: '#0B2540', borderColor: '#19466F' }]}>
          <View style={s.row}>
            <Text style={s.heading}>{t("Today's Earnings")}</Text>
            <View style={[s.goal,compact&&s.compactGoal]}>
              <Ionicons name="locate-outline" size={16} color="#94A3B8" />
              <Text style={s.goalText}>{t('Goal')}: {money(summary.goal)}</Text>
            </View>
          </View>

          {report.isLoading ? (
            <ActivityIndicator accessibilityLabel={t('Loading')} color="#4A6FE3" />
          ) : (
            <Text style={[s.earnings,compact && { fontSize: layout.amountSize, lineHeight: layout.amountSize * 1.2 }]}>{money(summary.income)}</Text>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              accessibilityRole="progressbar"
              accessibilityLabel={t('Daily income goal')}
              accessibilityValue={{
                min: 0,
                max: 100,
                now: summary.progress,
                text: summary.goal === null ? t('No daily goal set') : `${summary.percentage}%`,
              }}
              style={s.track}
            >
              <View style={[s.fill, { width: `${summary.progress}%` }]} />
            </View>
            <Text style={s.percent}>{summary.goal === null ? '—' : `${summary.percentage}%`}</Text>
          </View>

          {summary.goal === null && (
            <Text style={s.muted}>{t(dailyGoal ? 'No daily goal set' : 'Goal unavailable')}</Text>
          )}

          <View style={s.divider} />
          <View style={s.stats}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Mileage breakdown')}
              onPress={() => localizedAlert('Mileage breakdown',
                Array.isArray(report.data?.trip_breakdown)&&report.data.trip_breakdown.length
                  ? report.data.trip_breakdown.map((row: {platform:string|null;miles:number;trip_count:number}) => `${t(platformName(row.platform))}: ${Number(row.miles).toLocaleString(locale,{maximumFractionDigits:2})} ${t('miles')} · ${row.trip_count} ${t('trips')}`).join('\n')
                  : `${t('Business miles')}: ${summary.businessMiles ?? '—'}`)}
              style={[s.stat,compact && { minHeight: 54 + 22 * layout.density, gap: 3 }]}
            >
              <Ionicons name="trail-sign-outline" size={25} color="#0072B5" />
              <Text style={s.metric}>
                {summary.businessMiles === null
                  ? '—'
                  : summary.businessMiles.toLocaleString(locale, { maximumFractionDigits: 2 })}
              </Text>
              <View style={s.metricLabel}>
                <Text style={s.statLabel}>{t('Business miles')}</Text>
                <Ionicons
                  name="chevron-down"
                  size={12}
                  color="#94A3B8"
                />
              </View>
            </Pressable>

            <View style={[s.stat,s.statBorder,compact && { minHeight: 54 + 22 * layout.density, gap: 3 }]}>
              <Ionicons name="location-outline" size={25} color="#0072B5" />
              <Text style={s.metric}>{summary.trips ?? '—'}</Text>
              <Text style={s.statLabel}>{t('Trips saved')}</Text>
            </View>

            <View style={[s.stat,s.statBorder,compact && { minHeight: 54 + 22 * layout.density, gap: 3 }]} accessibilityLabel={t('Active shift elapsed time')}>
              <Ionicons name="time-outline" size={25} color="#0072B5" />
              <Text style={s.metric}>
                {shiftMinutes === null
                  ? '—'
                  : t('{hours}h {minutes}m', {
                      hours: Math.floor(shiftMinutes / 60),
                      minutes: shiftMinutes % 60,
                    })}
              </Text>
              <Text style={s.statLabel}>{t('Shift time')}</Text>
            </View>
          </View>


        </View>

        {grid ? <>
          <View testID="dashboard-actions-grid" style={s.actionColumns}><View style={s.actionColumn}>{shiftAction}</View><View style={s.actionColumn}>{tripAction}</View></View>
          {offerAction}
          {quickActions}
        </> : <>{shiftAction}{tripAction}{offerAction}{quickActions}</>}

        {trackingNotice && (
          <Pressable
            accessibilityRole="button"
            onPress={() => isTracking
              ? router.push('/tracking/active')
              : localizedAlert('Check trip tracking', trackingNotice)}
            style={s.link}
          >
            <Text style={s.muted}>{t('Check trip tracking')}</Text>
          </Pressable>
        )}
      </ScrollView>
      <StartTripModal visible={showStartTripModal} onClose={closeStartModal} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tabletContent: { maxWidth: 1080, paddingHorizontal: 24, paddingTop: 20 },
  viewport: { flex: 1 },
  actionColumns: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  actionColumn: { flex: 1, minWidth: 0 },
  compactHeader: { paddingVertical: 2 },
  compactGoal: { paddingVertical: 4 },
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, marginBottom: 4 },
  greetingGroup: { flex: 1, gap: 2 },
  greeting: { ...dashboardType.body, fontSize: 16,lineHeight:22, color: '#64748B' },
  name: { ...dashboardType.body, fontSize: 36,lineHeight:42, fontWeight: '700' },
  profile: { minWidth: 48, minHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  earningsCard: { backgroundColor: '#EDF5FF', borderColor: '#BCD5F0', padding: 18, gap: 12 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1' },
  goalText: { ...dashboardType.body, fontSize: 12, color: '#64748B' },
  heading: { ...dashboardType.body,...dashboardType.title, fontSize: 17, fontWeight: '700', flexShrink: 1 },
  muted: { ...dashboardType.body, fontSize: 13, color: '#64748B', flexShrink: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  earnings: { ...dashboardType.body,...dashboardType.amount, fontSize: 48, lineHeight:58, fontWeight: '700' },
  track: { flex: 1, height: 8, borderRadius: 6, overflow: 'hidden', backgroundColor: '#F1F5F9' },
  fill: { height: '100%', borderRadius: 6, backgroundColor: '#4A6FE3' },
  percent: { ...dashboardType.body, color: '#0072B5', fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 5 },
  stats: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  stat: { flex: 1, minWidth: 0, alignItems: 'center', gap: 5, minHeight: 76 },
  statBorder: { borderLeftWidth: 1, borderColor: '#E2E8F0' },
  metric: { ...dashboardType.body,...dashboardType.metric, fontSize: 21, fontWeight: '700', textAlign: 'center' },
  metricLabel: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statLabel: { ...dashboardType.body,...dashboardType.label, fontSize: 12, color: '#64748B', textAlign: 'center', flexShrink: 1 },
  navigation: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#F8FAFC' },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickButton: { flex: 1, minWidth: 125, minHeight: 72, padding: 12, borderWidth: 1, borderColor: '#DCE6FF', borderRadius: 16, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 10 },
  shiftButton: { backgroundColor: '#006BFF', borderRadius: 18, minHeight: 84, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  shiftIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  arrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  shiftHint: { ...dashboardType.body, fontSize: 13, color: '#E8EEFF' },
  tripIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  quickTitle: { ...dashboardType.body, fontSize: 15, fontWeight: '700' },
  quickHint: { ...dashboardType.body, fontSize: 12,lineHeight:17, color: '#64748B' },
  primary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, minHeight: 78, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 18 },
  primaryTitle: { ...dashboardType.body, color: '#FFFFFF', fontSize: 20,lineHeight:26, fontWeight: '700' },
  tripTitle: { ...dashboardType.body, fontSize: 18,lineHeight:24, fontWeight: '700' },
  primaryHint: { ...dashboardType.body, color: '#64748B', fontSize: 13 },
  link: { minHeight: 44, justifyContent: 'center' },
  blue: { ...dashboardType.body, color: '#0072B5', fontWeight: '600' },
  success: { ...dashboardType.body, color: '#15803D' },
});
