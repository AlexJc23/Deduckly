import { useLanguage, Translated } from "@/i18n/language";
import { Text } from "@/theme/components";

import { CurrentReport } from "../types/report.types";
import { ReportOverview, ReportDeductions, ReportSection, ReportTaxes } from "./ReportPresentation";
import { ExpenseBreakdownCard } from "./ExpenseBreakdownCard";

export function ReportBody({ report }: { report: CurrentReport }) {
  useLanguage();
  const empty = report.total_income === 0 && report.total_expenses === 0 && report.total_miles === 0;
  return <>
    {empty && <Text style={{ color: "#64748B", fontSize: 14, lineHeight: 21, marginBottom: 20 }}><Translated text={"No income, expenses, or mileage recorded in this period yet."} /></Text>}
    <ReportSection title="At a glance" description="Your recorded activity for the selected period."><ReportOverview report={report} /></ReportSection>
    <ReportSection title="Where your money went"><ExpenseBreakdownCard report={report} /></ReportSection>
    <ReportSection title="From income to deductions"><ReportDeductions report={report} /></ReportSection>
    <ReportSection title="Tax estimates" description="Based on this report and your selected tax method."><ReportTaxes report={report} /></ReportSection>
  </>;
}
