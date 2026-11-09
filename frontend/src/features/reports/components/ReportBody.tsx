import { VehicleReportBody } from './VehicleReportBody';
import { useLanguage, Translated } from "@/i18n/language";
import { useState, type PropsWithChildren } from "react";
import { ReportComparison } from "./ReportComparison";
import { Pressable, Text, View } from "@/theme/components";

import { CurrentReport } from "../types/report.types";
import { ReportOverview, ReportDeductions, ReportSection, ReportTaxes } from "./ReportPresentation";
import { ExpenseBreakdownCard } from "./ExpenseBreakdownCard";

export function ReportBody({ report }: { report: CurrentReport }) {
  useLanguage();
  const empty = Number(report.total_income) === 0 && Number(report.total_expenses) === 0 && Number(report.total_miles) === 0;
  return <>
    {empty && <Text style={{ color: "#64748B", fontSize: 14, lineHeight: 21, marginBottom: 20 }}><Translated text={"No income, expenses, or mileage recorded in this period yet."} /></Text>}
    <ReportSection title="At a glance" description="Your recorded activity for the selected period."><ReportOverview report={report} /></ReportSection>
    <ReportComparison report={report} />
    <ReportDetails title="Where your money went"><ExpenseBreakdownCard report={report} /></ReportDetails>
    <ReportDetails title="From income to deductions"><ReportDeductions report={report} /></ReportDetails>
    <ReportDetails title="Tax estimates"><ReportTaxes report={report} /></ReportDetails>
    {report.report_version === 2 && <VehicleReportBody report={report} detailsOnly />}
  </>;
}

function ReportDetails({ title, children }: PropsWithChildren<{ title: string }>) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  return <View style={{ marginBottom: 14 }}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)}
      style={{ minHeight: 56, padding: 16, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E7EF', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={{ flex: 1, fontSize: 17, fontWeight: '600' }}>{t(title)}</Text>
      <Text style={{ color: '#0072B5', fontSize: 22 }}>{expanded ? '−' : '+'}</Text>
    </Pressable>
    {expanded && <View style={{ marginTop: 10 }}>{children}</View>}
  </View>;
}
