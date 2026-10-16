import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, StyleSheet, useWindowDimensions, type Text as NativeText } from 'react-native';
import { useLanguage } from '@/i18n/language';
import { View, Text, Pressable } from '@/theme/components';
import { useAppTheme } from '@/theme/theme';
import { Ionicons } from '@/theme/icons';
import type { OfferResult, PremiumOfferResult } from '../types/offer.types';
import { presentOfferResult, type ResultMetric } from '../utils/result-presentation';
export function OfferResultCard({ result }: { result: OfferResult | PremiumOfferResult }) {
  const { t, locale } = useLanguage(); const { dark } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const heading = useRef<NativeText>(null);
  const p = presentOfferResult(result);
  const a = result.fuel?.assumptions;
  const palette = p.recommendation === 'accept' ? ['#22C55E', '#166534', '#86EFAC']
    : p.recommendation === 'consider' ? ['#F59E0B', '#92400E', '#FCD34D'] : ['#EF4444', '#991B1B', '#FCA5A5'];
  const color = dark ? palette[2] : palette[1];
  const money = (value: number) => Number.isFinite(value) ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value) : '—';
  const format = (metric: ResultMetric) => metric.unit === 'score' ? `${metric.value}/100`
    : metric.unit === 'miles' ? `${metric.value.toFixed(2)} ${t('miles')}`
    : money(metric.value) + (metric.unit === 'per-mile' ? t('/mi') : metric.unit === 'per-hour' ? t('/hr') : '');
  useEffect(() => {
    setExpanded(false);
    let active = true; let frame: number | undefined;
    void AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
      if (active && enabled) frame = requestAnimationFrame(() => {
        const tag = findNodeHandle(heading.current); if (active && tag) AccessibilityInfo.setAccessibilityFocus(tag);
      });
    }).catch(() => {});
    return () => { active = false; if (frame !== undefined) cancelAnimationFrame(frame); };
  }, [result]);
  const row = (metric: ResultMetric, index: number) => <View key={metric.label + index}
    style={[styles.row, (width < 360 || fontScale > 1.3) && styles.stacked]}>
    <Text style={styles.label}>{t(metric.label)}</Text><Text style={styles.value}>{format(metric)}</Text>
  </View>;
  const age = a?.observedAt ? Date.parse(a.observedAt) : NaN;
  return <View style={[styles.card, { borderColor: palette[0], backgroundColor: dark ? '#172333' : '#FFFFFF' }]}>
    <View style={styles.header}>
      <Text ref={heading} accessible accessibilityRole="header" accessibilityLiveRegion="polite"
        style={[styles.verdict, { color }]}>{t(p.recommendation.toUpperCase())}</Text>
      <Text style={styles.explanation}>{t(p.explanation)}</Text>
    </View>
    {!p.hasFuel && <Text style={styles.notice}>{t('Gross-only mileage · fuel excluded')}</Text>}
    {p.hero && <View style={styles.earnings}>
      <Text style={styles.label}>{t(p.hero.label)}</Text><Text style={styles.amount}>{money(p.hero.value)}</Text>
      <View style={styles.breakdown}>{p.breakdown.map(row)}{!p.hasFuel && <Text style={styles.context}>{t('Estimated fuel cost')}: {t('Not included')}</Text>}</View>
    </View>}
    <View style={styles.metrics}>{p.primary.map(row)}</View>
    {a && <Text style={styles.context}>{a.vehicle} · {a.economy != null && Number.isFinite(a.economy) ? a.economy : '—'} {a.fuelType === 'electric' ? 'kWh/100 mi' : 'MPG'} · {p.hasFuel && a.price !== null ? money(a.price) : '—'}{a.fuelType === 'electric' ? t('/kWh') : t('/US gal')}</Text>}
    <Text style={styles.disclaimer}>{t('Estimates only; not net profit.')}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={t('Why this result?')}
      onPress={() => setExpanded(value => !value)} style={styles.toggle}>
      <Text style={styles.detailsTitle}>{t('Why this result?')}</Text>
      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={dark ? '#EDF3FA' : '#273449'} />
    </Pressable>
    {expanded && <View style={styles.details}>
      {p.details.map(row)}
      {p.premium && <Text style={styles.context}>{t(p.hasFuel
        ? 'Earnings and hourly targets use total vehicle costs; per-mile targets use earnings after fuel.'
        : 'Fuel is unavailable. Per-mile targets use gross payout; earnings targets still use your vehicle-cost allowance.')}</Text>}
      {p.checks.map(check => <View key={check.title} style={styles.check}>
        <Text style={styles.label}>{t(check.title === 'Minimum Profit' ? 'Minimum earnings target' : check.title)}: {check.title === 'Trip Distance' ? `${check.target.toFixed(2)} ${t('miles')}` : money(check.target) + (check.title === 'Dollars Per Mile' ? t('/mi') : check.title === 'Hourly Earnings' ? t('/hr') : '')}</Text>
        <Text style={{ color: check.passed ? (dark ? '#86EFAC' : '#166534') : (dark ? '#FCA5A5' : '#991B1B'), fontWeight: '700' }}>{t(check.passed ? 'Met' : 'Missed')}</Text>
      </View>)}
      {p.standardTargets.length > 0 && <View style={styles.details}>
        <Text style={styles.detailsTitle}>{t('Standard rate targets')}</Text>
        {p.standardTargets.map(target => <Text key={target.tier} style={styles.context}>{t(target.tier)}: {money(target.dollarsPerMile)}{t('/mi')}{result.hourlyRate !== null ? ` · ${money(target.hourlyRate)}${t('/hr')}` : ''}</Text>)}
      </View>}
      {p.reasons.filter(reason => !reason.includes('Fuel estimate') && !reason.includes('include estimated fuel')).map(reason => <Text key={reason} style={styles.context}>{t(reason)}</Text>)}
      {result.hourlyRate === null && <Text style={styles.context}>{t('No duration entered; hourly estimates are omitted.')}</Text>}
      {p.premium && p.hasFuel && <Text style={styles.context}>{t('Total vehicle cost uses the larger of your saved cost estimate or fuel cost; fuel is not added twice.')}</Text>}
      {a && <Text style={styles.context}>{t('Price source')}: {t(a.source)}{a.location ? ' · ' + a.location : ''}</Text>}
      {Number.isFinite(age) && <Text style={styles.context}>{t('Price observed')}: {new Date(age).toLocaleString(locale)} · {t('{minutes} min old', { minutes: Math.max(0, Math.floor((Date.now() - age) / 60000)) })}</Text>}
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 20, borderRadius: 20, borderWidth: 1, gap: 16 },
  header: { gap: 6 }, verdict: { fontSize: 28, fontWeight: '800', letterSpacing: .5 },
  explanation: { fontSize: 15, lineHeight: 22 }, notice: { fontSize: 13, fontWeight: '600' },
  earnings: { gap: 4 }, amount: { fontSize: 32, fontWeight: '800' },
  breakdown: { gap: 6, paddingTop: 6 }, metrics: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#94A3B8' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start', gap: 3 },
  label: { flexShrink: 1, fontSize: 14 }, value: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  context: { fontSize: 13, lineHeight: 20 }, disclaimer: { fontSize: 12, lineHeight: 18 },
  toggle: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderColor: '#94A3B8', paddingTop: 10 },
  detailsTitle: { fontSize: 15, fontWeight: '700' }, details: { gap: 12 },
  check: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 },
});
