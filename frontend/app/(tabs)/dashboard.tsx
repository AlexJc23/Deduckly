import { dashboardType } from '@/theme/typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ActionSheetIOS,
  findNodeHandle,
  View as NativeView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
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
import { Pressable, SafeAreaView, Text, View } from '@/theme/components';
import { Ionicons } from '@/theme/icons';
import { useAppTheme } from '@/theme/theme';

export default function DashboardScreen() {
  const { dark } = useAppTheme();
  const { width, height, fontScale } = useWindowDimensions();
  const [availableWidth, setAvailableWidth] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const viewportWidth = availableWidth || width;
  const viewportHeight = availableHeight || Math.max(0, height - 140);
  const grid = viewportWidth >= 700 && viewportHeight >= 400 && fontScale <= 1.3;
  const { t, locale } = useLanguage();
  const userQuery = useCurrentUser();
  const { saved } = useLocalSearchParams();
  const { isTracking, isReady, trackingNotice, startTrackingFromSiri } = useTracking();
  const { entries } = useShifts();
  const report = useTodayReport();
  const { data: dailyGoal } = useDailyGoal();

  const [showStartTripModal, setShowStartTripModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [now, setNow] = useState(() => Date.now());
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
      : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
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

  const shiftMinutes = activeShift ? elapsedMinutes(activeShift.data.started_at, null, now) : null;

  const usableHeight = viewportHeight
    - (showBanner ? 32 * fontScale : 0)
    - (report.isError ? 76 * fontScale : 0)
    - (trackingNotice ? 48 * fontScale : 0)
    - (active ? 64 : 0);
  const compact = usableHeight < 670 || fontScale > 1.2;
  const condensed = usableHeight < 510 || fontScale > 1.3;
  const showStats = !condensed;

  // Continuous density prevents a small change in phone height leaving a large empty area.
  const density = Math.max(0, Math.min(1, (usableHeight - 540) / 220));

  // Reduce decoration before reducing readable text or touch target sizes.
  const layout = {
    padding: 12 + Math.round(6 * density),
    gap: 8 + Math.round(4 * density),
    density,
    actionHeight: 56 + Math.round(20 * density),
    iconSize: 36 + Math.round(12 * density),
    amountSize: condensed ? 32 : compact ? 40 : 48,
  };
  const supporting = usableHeight >= 650 && fontScale <= 1.2;
  const actionStyle = {
    minHeight: layout.actionHeight,
    paddingHorizontal: layout.padding,
    paddingVertical: compact ? 8 : 14,
  };
  const iconStyle = { width: layout.iconSize, height: layout.iconSize };

  const showDailyDetails = () => localizedAlert(
    "Today's Earnings",
    [
      `${t('Business miles')}: ${summary.businessMiles ?? '—'}`,
      `${t('Trips saved')}: ${summary.trips ?? '—'}`,
      `${t('Shift time')}: ${shiftMinutes === null ? '—' : t('{hours}h {minutes}m', {
        hours: Math.floor(shiftMinutes / 60), minutes: shiftMinutes % 60,
      })}`,
      ...(Array.isArray(report.data?.trip_breakdown)
        ? report.data.trip_breakdown.map((row: { platform: string | null; miles: number; trip_count: number }) =>
          `${t(platformName(row.platform))}: ${Number(row.miles).toLocaleString(locale, { maximumFractionDigits: 2 })} ${t('miles')} · ${row.trip_count} ${t('trips')}`)
        : []),
    ].join('\n'),
  );
  const actionsAnchorRef = useRef<React.ComponentRef<typeof NativeView>>(null);
  const openActions = () => {
    const actions = [
      { label: t('Add Income'), run: () => router.push('/income/create') },
      { label: t('Add Expense'), run: () => router.push('/expense/create') },
      { label: t('Offer Analyzer'), run: () => router.push('/offer-analyzer/screens/OfferAnalyzerScreen') },
      { label: t("Today's Earnings"), run: showDailyDetails },
    ];
    ActionSheetIOS.showActionSheetWithOptions({
      options: [t('Cancel'), ...actions.map(action => action.label)],
      cancelButtonIndex: 0,
      anchor: findNodeHandle(actionsAnchorRef.current) ?? undefined,
      userInterfaceStyle: dark ? 'dark' : 'light',
    }, index => { if (index > 0) actions[index - 1]?.run(); });
  };

  const shiftAction = (
    <>
      <ShiftEntryPoint manualActive={isTracking} activeOnly compact />

      {!active && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Start Shift')}
          onPress={() => router.push('/shifts')}
          style={[s.shiftButton, actionStyle]}
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
      )}
    </>
  );

  const tripAction = (
    <Pressable
      accessibilityRole="button"
      disabled={!isReady}
      accessibilityHint={t(isTracking ? 'View active trip' : 'Or say “Siri, Start a trip in Deduckly”')}
      accessibilityState={{ disabled: !isReady }}
      onPress={() => (isTracking ? router.push('/tracking/active') : openStartModal())}
      style={[s.primary, actionStyle, !isReady && { opacity: 0.5 }]}
    >
      <View style={[s.tripIcon, iconStyle]}>
        <Ionicons name={isTracking ? 'navigate' : 'play'} color="#0072B5" size={27} />
      </View>

      <View style={{ flex: 1, gap: 5 }}>
        <Text style={s.tripTitle}>{t(isTracking ? 'Trip in Progress' : 'Start a Trip')}</Text>
        {supporting && (
          <Text style={s.primaryHint}>
            {t(isTracking ? 'View active trip' : 'Or say “Siri, Start a trip in Deduckly”')}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={21} color="#94A3B8" />
    </Pressable>
  );

  const quickActions = (
    <View style={s.quick}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/income/create')}
        style={[
          s.quickButton,
          compact && {
            minHeight: Math.max(48, layout.actionHeight - 12),
            paddingHorizontal: layout.padding,
            paddingVertical: 8 + 6 * layout.density,
          },
        ]}
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
        style={[
          s.quickButton,
          compact && {
            minHeight: Math.max(48, layout.actionHeight - 12),
            paddingHorizontal: layout.padding,
            paddingVertical: 8 + 6 * layout.density,
          },
        ]}
      >
        <Ionicons name="receipt-outline" size={23} color="#50C7EF" />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={s.quickTitle}>{t('Add Expense')}</Text>
          {supporting && <Text style={s.quickHint}>{t('Record an expense')}</Text>}
        </View>
      </Pressable>
    </View>
  );

  const offerAction = (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/offer-analyzer/screens/OfferAnalyzerScreen')}
      style={[s.card, s.navigation, actionStyle]}
    >
      <View style={[s.icon, iconStyle]}>
        <Ionicons name="analytics-outline" size={27} color="#50C7EF" />
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text style={s.heading}>{t('Offer Analyzer')}</Text>
        {supporting && <Text style={s.muted}>{t('Is that offer worth it?')}</Text>}
      </View>

      <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
    </Pressable>
  );

  const earningsCard = (
        <View
          style={[
            s.card,
            s.earningsCard,
            { padding: layout.padding, gap: 6 + 6 * layout.density },
            dark && { backgroundColor: '#0B2540', borderColor: '#19466F' },
          ]}
        >
          <View style={s.row}>
            <Text style={s.heading}>{t("Today's Earnings")}</Text>
            <View style={[s.goal, compact && s.compactGoal]}>
              <Ionicons name="locate-outline" size={16} color="#94A3B8" />
              <Text style={s.goalText}>
                {t('Goal')}: {money(summary.goal)}
              </Text>
            </View>
          </View>

          {report.isLoading ? (
            <ActivityIndicator accessibilityLabel={t('Loading')} color="#4A6FE3" />
          ) : (
            <Text style={[s.earnings, compact && { fontSize: layout.amountSize, lineHeight: layout.amountSize * 1.2 }]}>
              {money(summary.income)}
            </Text>
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

          {showStats && <>
          <View style={s.divider} />
          <View style={s.stats}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Mileage breakdown')}
              onPress={() =>
                localizedAlert(
                  'Mileage breakdown',
                  Array.isArray(report.data?.trip_breakdown) && report.data.trip_breakdown.length
                    ? report.data.trip_breakdown
                        .map(
                          (row: { platform: string | null; miles: number; trip_count: number }) =>
                            `${t(platformName(row.platform))}: ${Number(row.miles).toLocaleString(locale, { maximumFractionDigits: 2 })} ${t('miles')} · ${row.trip_count} ${t('trips')}`,
                        )
                        .join('\n')
                    : `${t('Business miles')}: ${summary.businessMiles ?? '—'}`,
                )
              }
              style={[s.stat, compact && { minHeight: 54 + 22 * layout.density, gap: 3 }]}
            >
              <Ionicons name="trail-sign-outline" size={25} color="#0072B5" />
              <Text style={s.metric}>
                {summary.businessMiles === null
                  ? '—'
                  : summary.businessMiles.toLocaleString(locale, { maximumFractionDigits: 2 })}
              </Text>
              <View style={s.metricLabel}>
                <Text style={s.statLabel}>{t('Business miles')}</Text>
                <Ionicons name="chevron-down" size={12} color="#94A3B8" />
              </View>
            </Pressable>

            <View
              style={[
                s.stat,
                s.statBorder,
                compact && { minHeight: 54 + 22 * layout.density, gap: 3 },
              ]}
            >
              <Ionicons name="location-outline" size={25} color="#0072B5" />
              <Text style={s.metric}>{summary.trips ?? '—'}</Text>
              <Text style={s.statLabel}>{t('Trips saved')}</Text>
            </View>

            <View
              style={[
                s.stat,
                s.statBorder,
                compact && { minHeight: 54 + 22 * layout.density, gap: 3 },
              ]}
              accessibilityLabel={t('Active shift elapsed time')}
            >
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
          </>}
          {!showStats && (
            <Pressable accessibilityRole="button" onPress={showDailyDetails} style={s.detailsButton}>
              <Text style={s.blue}>{t('View details')}</Text>
              <Ionicons name="chevron-forward" size={18} color="#50C7EF" />
            </Pressable>
          )}
        </View>

  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={s.screen}>
      <View
        style={s.viewport}
        onLayout={(event) => {
          setAvailableWidth(event.nativeEvent.layout.width);
          setAvailableHeight(event.nativeEvent.layout.height);
        }}
      >
      <View
        testID={condensed ? 'dashboard-condensed' : grid ? 'dashboard-wide' : 'dashboard-standard'}
        style={[s.content, grid && s.wideContent, { gap: layout.gap }]}
      >
        <View style={[s.header, compact && s.compactHeader]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Profile')}
            onPress={() => router.push('/settings/edit-profile')}
            style={s.profile}
          >
            <Ionicons name="person-outline" size={27} color="#50C7EF" />
          </Pressable>
          <View style={s.greetingGroup}>
            <Text accessibilityRole="header" style={s.greeting}>
              {greeting}{userQuery.data?.first_name ? ', ' : ''}
              {userQuery.data?.first_name && <Text style={s.name}>{userQuery.data.first_name}!</Text>}
            </Text>
          </View>
        </View>

        {showBanner && (
          <Text accessibilityLiveRegion="polite" style={s.success}>
            {t('Trip Saved Successfully')}
          </Text>
        )}

        {report.isError && (
          <Pressable accessibilityRole="button" onPress={() => void report.refetch()} style={s.card}>
            <Text>{t('Could not refresh today’s data. Tap to retry.')}</Text>
          </Pressable>
        )}

        <View style={[s.dashboardBody, !grid && !condensed && s.fillBody, grid && s.dashboardColumns]}>
          <View style={grid ? s.summaryColumn : undefined}>{earningsCard}</View>
          <View style={[s.actions, !grid && !condensed && s.fillActions, grid && s.actionColumn]}>
            {shiftAction}
            {tripAction}
            {condensed ? (
              <NativeView ref={actionsAnchorRef} collapsable={false}>
              <Pressable accessibilityRole="button" onPress={openActions} style={[s.card, s.moreActions]}>
                <Ionicons name="grid-outline" size={23} color="#50C7EF" />
                <Text style={[s.heading, { flex: 1 }]}>{t('More actions')}</Text>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </Pressable>
              </NativeView>
            ) : <>{offerAction}{quickActions}</>}
          </View>
        </View>

        {trackingNotice && (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              isTracking
                ? router.push('/tracking/active')
                : localizedAlert('Check trip tracking', trackingNotice)
            }
            style={s.link}
          >
            <Text style={s.muted}>{t('Check trip tracking')}</Text>
          </Pressable>
        )}
      </View>

      </View>

      <StartTripModal visible={showStartTripModal} onClose={closeStartModal} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wideContent: { maxWidth: 1080, paddingHorizontal: 24, paddingTop: 8 },
  viewport: { flex: 1 },
  dashboardBody: { gap: 12 },
  fillBody: { flex: 1, minHeight: 0 },
  fillActions: { flex: 1, justifyContent: 'space-evenly', gap: 10 },
  dashboardColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  summaryColumn: { flex: 1.1, minWidth: 0 },
  actions: { gap: 8 },
  moreActions: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, padding: 12 },
  detailsButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionColumn: { flex: 1, minWidth: 0 },
  compactHeader: { paddingVertical: 2 },
  compactGoal: { paddingVertical: 4 },
  screen: { flex: 1, backgroundColor: '#F8FAFC', },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  greetingGroup: { flex: 1, minWidth: 0 },
  greeting: { ...dashboardType.body, fontSize: 17, lineHeight: 24,color: '#64748B', },
  name: { ...dashboardType.body, fontSize: 17, lineHeight: 24, fontWeight: '700', },
  profile: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  earningsCard: {
    backgroundColor: '#EDF5FF',
    borderColor: '#BCD5F0',
    padding: 18,
    gap: 12,
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  goalText: { ...dashboardType.body, fontSize: 12, color: '#64748B' },
  heading: {
    ...dashboardType.body,
    ...dashboardType.title,
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
  },
  muted: { ...dashboardType.body, fontSize: 13, color: '#64748B', flexShrink: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  earnings: {
    ...dashboardType.body,
    ...dashboardType.amount,
    fontSize: 48,
    lineHeight: 58,
    fontWeight: '700',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  fill: { height: '100%', borderRadius: 6, backgroundColor: '#4A6FE3' },
  percent: { ...dashboardType.body, color: '#0072B5', fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 5 },
  stats: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  stat: { flex: 1, minWidth: 0, alignItems: 'center', gap: 5, minHeight: 76 },
  statBorder: { borderLeftWidth: 1, borderColor: '#E2E8F0' },
  metric: {
    ...dashboardType.body,
    ...dashboardType.metric,
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  metricLabel: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statLabel: {
    ...dashboardType.body,
    ...dashboardType.label,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    flexShrink: 1,
  },
  navigation: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickButton: {
    flex: 1,
    minWidth: 125,
    minHeight: 72,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shiftButton: {
    backgroundColor: '#006BFF',
    borderRadius: 18,
    minHeight: 84,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  shiftIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftHint: { ...dashboardType.body, fontSize: 13, color: '#E8EEFF' },
  tripIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: { ...dashboardType.body, fontSize: 15, fontWeight: '700' },
  quickHint: { ...dashboardType.body, fontSize: 12, lineHeight: 17, color: '#64748B' },
  primary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    minHeight: 78,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  primaryTitle: { ...dashboardType.body, color: '#FFFFFF', fontSize: 20, lineHeight: 26, fontWeight: '700' },
  tripTitle: { ...dashboardType.body, fontSize: 18, lineHeight: 24, fontWeight: '700' },
  primaryHint: { ...dashboardType.body, color: '#64748B', fontSize: 13 },
  link: { minHeight: 44, justifyContent: 'center' },
  blue: { ...dashboardType.body, color: '#0072B5', fontWeight: '600' },
  success: { ...dashboardType.body, color: '#15803D' },
});
