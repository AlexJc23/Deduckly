import { View, Text } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { CurrentReport } from '../types/report.types';
import { reportImpactColor } from '../utils/report-display';
import { ReportSection } from './ReportPresentation';

export function ReportComparison({ report }: { report: CurrentReport }) {
  const { t, locale } = useLanguage();
  const previous = report.comparison;
  if (!previous) return null;
  const now = new Date();
  const currentMonth = report.year === now.getFullYear() && report.month === now.getMonth() + 1;
  const period = new Date(previous.year, previous.month - 1, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const amount = (value: number, currency: boolean) => new Intl.NumberFormat(locale, currency
    ? { style: 'currency', currency: 'USD' } : { maximumFractionDigits: 2 }).format(value);
  return <ReportSection title="Compared with last month" description={currentMonth ? "This month so far compared with the full previous month." : "Selected month compared with the full previous month."}>
    <View style={{ borderRadius: 18, padding: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E7EF', gap: 16 }}>
      <Text style={{ color: '#64748B' }}>{period}</Text>
      {([
        ['Recorded income', 'total_income', true],
        ['Recorded expenses', 'total_expenses', true],
        ['Business mileage', 'total_miles', false],
      ] as const).map(([label, key, currency]) => {
        const current = Number(report[key]); const before = Number(previous[key]);
        const delta = current - before;
        const color = reportImpactColor(delta, key === 'total_expenses');
        return <View key={key} style={{ gap: 4 }}>
          <Text style={{ fontWeight: '600' }}>{t(label)}</Text>
          <Text>{amount(current, currency)}{!currency ? ` ${t('miles')}` : ''} · {t('Last month')}: {amount(before, currency)}{!currency ? ` ${t('miles')}` : ''}</Text>
          <Text style={{ color, fontSize: 13, fontWeight: '700' }}>{delta > 0 ? '+' : delta < 0 ? '−' : ''}{amount(Math.abs(delta), currency)}{!currency ? ` ${t('miles')}` : ''}{before > 0 ? ` (${delta > 0 ? '+' : ''}${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(delta / before * 100)}%)` : ''}</Text>
        </View>;
      })}
    </View>
  </ReportSection>;
}
