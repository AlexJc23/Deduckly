import { Pressable, Text, View } from "@/theme/components";
import { PropsWithChildren, useState } from "react";
import { ActivityIndicator, StyleSheet, useWindowDimensions } from "react-native";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { money, miles, reportImpact } from "../utils/report-display";
import { CurrentReport } from "../types/report.types";

export function ReportSection({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  return <View style={s.section}><Text accessibilityRole="header" style={s.sectionTitle}>{title}</Text>
    {description && <Text style={s.description}>{description}</Text>}{children}</View>;
}
export function ReportRow({ label, value, detail, color }: { label: string; value: string; detail?: string; color?: string }) {
  const isTablet = useIsTablet();
  const { fontScale } = useWindowDimensions();
  return <View style={[s.row, (!isTablet || fontScale > 1.2) && s.stacked]}>
    <View style={s.rowCopy}><Text style={s.label}>{label}</Text>{detail && <Text style={s.detail}>{detail}</Text>}</View>
    <Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[s.value, color ? { color } : undefined]}>{value}</Text></View>;
}
export function ReportOverview({ report }: { report: CurrentReport }) {
  const isTablet = useIsTablet();
  const { fontScale } = useWindowDimensions();
  const [availableWidth, setAvailableWidth] = useState(0);
  // Window width alone overestimates space when a tablet sidebar is visible.
  const columns = isTablet && availableWidth >= 720 && fontScale <= 1.2;
  return <View onLayout={event => setAvailableWidth(event.nativeEvent.layout.width)}
    style={[s.metrics, !columns && s.stacked]}>
    {[{ label: "Recorded income", impact: reportImpact(report.total_income), value: money(report.total_income), detail: "Income entries in this period" },
      { label: "Recorded expenses", impact: reportImpact(report.total_expenses, true), value: money(report.total_expenses), detail: "Spending before tax adjustments" },
      { label: "Recorded mileage", impact: undefined, value: miles(report.total_miles), detail: "Distance across your recorded trips" }].map(item =>
      <View key={item.label} style={[s.metric, columns ? s.metricColumn : s.metricFull, item.impact && { borderColor: item.impact.borderColor, backgroundColor: item.impact.backgroundColor }]}>
        <Text style={s.label}>{item.label}</Text>
        <Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[s.metricValue, item.impact && { color: item.impact.color }]}>{item.value}</Text>
        <Text style={s.detail}>{item.detail}</Text>
      </View>)}
  </View>;
}
export function ReportDeductions({ report }: { report: CurrentReport }) {
  const standard = report.tax_method === "standard_mileage";
  return <View style={s.card}>
    <Text style={s.method}>{standard ? "Standard mileage method" : "Actual expense method"}</Text>
    <Text style={s.description}>Deductions reduce the income used in the tax estimate. They are different from the money you spent.</Text>
    {standard && <ReportRow label="Mileage deduction" value={money(report.mileage_deduction)} detail="Deduction recorded for your mileage" />}
    <ReportRow label="Deductible expenses" value={money(report.deductible_expense_total)} detail={standard ? "Eligible expenses after the mileage-method adjustment" : "Eligible expense amounts after business-use adjustments"} />
    <ReportRow label="Total deductions" value={money(report.total_deductions)} detail={standard ? "Mileage deduction + deductible expenses" : "Deductible expenses under your selected method"} />
    <View style={[s.highlight, { backgroundColor: reportImpact(report.net_profit).backgroundColor }]}><Text style={s.label}>Income after deductions</Text><Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[s.heroValue, { color: reportImpact(report.net_profit).color }]}>{money(report.net_profit)}</Text>
      <Text style={s.detail}>Recorded income − total deductions. This is the report’s net profit calculation, not income minus recorded spending.</Text></View>
  </View>;
}
export function ReportTaxes({ report }: { report: CurrentReport }) {
  return <View style={s.card}>
    <ReportRow label="Income used for the tax estimate" value={money(report.taxable_income)} detail="Income after deductions, with a minimum of $0" />
    <ReportRow label="Estimated income tax" color={reportImpact(report.estimated_tax_owed, true).color} value={money(report.estimated_tax_owed)} detail="Calculated for this report using the configured tax brackets" />
    <ReportRow label="Estimated reduction from deductions" color={reportImpact(report.estimated_tax_savings).color} value={money(report.estimated_tax_savings)} detail="Difference between the estimate with and without deductions; not a refund" />
    <Text style={s.note}>These figures are estimates from your recorded data, not a final tax bill or a payment due. Your final tax outcome can differ.</Text>
  </View>;
}
export function ReportLoadState({ loading, retry }: { loading: boolean; retry: () => void }) {
  return <View style={s.state}>{loading ? <><ActivityIndicator color="#0072B5" /><Text style={s.description}>Loading this report…</Text></>
    : <><Text accessibilityRole="header" style={s.sectionTitle}>Couldn’t load this report</Text><Text style={s.description}>Try again or choose another period. Your records have not been changed.</Text>
      <Pressable accessibilityRole="button" onPress={retry} style={s.retry}><Text style={s.retryText}>Try again</Text></Pressable></>}</View>;
}
const s = StyleSheet.create({
  section: { gap: 10, marginBottom: 26 }, sectionTitle: { fontSize: 19, fontWeight: "700", color: "#273449" },
  description: { fontSize: 14, lineHeight: 21, color: "#64748B" },
  metrics: { flexDirection: "row", gap: 12 }, stacked: { flexDirection: "column", alignItems: "stretch" },
  metric: { backgroundColor: "#FFFFFF", borderColor: "#E1E7EF", borderWidth: 1, borderRadius: 18, padding: 18, gap: 8 },
  metricFull: { width: "100%", flexShrink: 0 },
  metricColumn: { flex: 1, minWidth: 0 },
  metricValue: { fontSize: 28, fontWeight: "700", color: "#0072B5", fontVariant: ["tabular-nums"] },
  card: { padding: 20, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E1E7EF" },
  method: { fontSize: 15, fontWeight: "600", color: "#0072B5", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E1E7EF" },
  rowCopy: { flex: 1, gap: 5 }, label: { fontSize: 15, lineHeight: 21, fontWeight: "600", color: "#273449" },
  detail: { fontSize: 13, lineHeight: 19, color: "#64748B" }, value: { fontSize: 17, fontWeight: "600", color: "#273449", flexShrink: 1, fontVariant: ["tabular-nums"] },
  highlight: { backgroundColor: "#EAF3FA", borderRadius: 12, padding: 16, marginTop: 18, gap: 8 },
  heroValue: { fontSize: 28, fontWeight: "700", color: "#0072B5", fontVariant: ["tabular-nums"] },
  note: { fontSize: 12, lineHeight: 19, color: "#64748B", marginTop: 16 },
  state: { paddingVertical: 40, alignItems: "center", gap: 14 }, retry: { minHeight: 48, padding: 14, backgroundColor: "#0072B5", borderRadius: 12 }, retryText: { color: "white", fontWeight: "600" },
});
