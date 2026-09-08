import { useLanguage, Translated } from "@/i18n/language";
import { ScrollView, Text, View } from "@/theme/components";
import { StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { BackHeader } from "@/components/ui/BackButton";
import { useCurrentReport } from "@/features/reports/hooks/use-current-report";

import { money, reportPeriodLabel, reportImpact } from "@/features/reports/utils/report-display";
import { ReportLoadState } from "@/features/reports/components/ReportPresentation";

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  useLanguage();
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{<Translated text={title} />}</Text>
      {children}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  useLanguage();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, bold && styles.bold]}>
        {<Translated text={label} />}
      </Text>

      <Text style={[styles.value, bold && styles.bold, color ? { color } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

export default function IrsSummaryScreen() {
  const { locale } = useLanguage();
  const { year, month, day, startDate, endDate } = useLocalSearchParams<{
    year?: string; month?: string; day?: string; startDate?: string; endDate?: string;
  }>();
  const params = {
    year: year ? Number(year) : undefined,
    month: month ? Number(month) : undefined,
    day: day ? Number(day) : undefined,
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T00:00:00`) : undefined,
  };

  const { data, isLoading, isError, refetch } = useCurrentReport(params);
  if (isLoading || isError || !data) {
    return <View style={styles.container}><BackHeader /><ReportLoadState loading={isLoading} retry={() => void refetch()} /></View>;
  }
  const reportPeriod = reportPeriodLabel(startDate && endDate ? params : { year: data.year, month: data.month, day: data.day }, locale);

  return (
    <View style={styles.container}>
      <BackHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}><Translated text={"Tax summary"} /></Text>

        <Text style={styles.subtitle}>
          {reportPeriod} <Translated text={"· Estimates from your recorded activity."} /></Text>

        <SummaryCard title="Business Information">
          <SummaryRow
            label="Report Period"
            value={reportPeriod}
          />

          <SummaryRow
            label="Business Type"
            value={formatLabel(data.business_type)}
          />

          <SummaryRow
            label="Tax Method"
            value={formatLabel(data.tax_method)}
          />

          <SummaryRow
            label="Filing Status"
            value={formatLabel(data.filing_status)}
          />
        </SummaryCard>

        <SummaryCard title="Income">
          <SummaryRow
            label="Gross Income"
            color={reportImpact(data.total_income).color}
            value={money(data.total_income)}
          />
        </SummaryCard>

        <SummaryCard title="Business Deductions">
          {data.tax_method === "standard_mileage" ? (
            <>
              <SummaryRow
                label="Mileage Deduction"
                value={money(data.mileage_deduction)}
              />

              <SummaryRow
                label="Deductible expenses"
                value={money(data.deductible_expense_total)}
              />
            </>
          ) : (
            <>
              {Object.entries(data.deductible_breakdown ?? {}).map(
                ([category, details]: [string, any]) => (
                  <SummaryRow
                    key={category}
                    label={formatLabel(category)}
                    value={money(details.amount)}
                  />
                )
              )}
            </>
          )}

          <SummaryRow
            label="Total Deductions"
            value={money(data.total_deductions)}
            bold
          />
        </SummaryCard>

        <SummaryCard title="Tax estimate">
          <Text style={styles.note}><Translated text={"Income after deductions is recorded income minus total deductions. The estimate does not represent a refund or a final payment due."} /></Text>
          <SummaryRow
            label="Income after deductions"
            color={reportImpact(data.net_profit).color}
            value={money(data.net_profit)}
          />

          <SummaryRow
            label="Taxable Income"
            value={money(data.taxable_income)}
          />

          <SummaryRow
            label="Estimated income tax"
            color={reportImpact(data.estimated_tax_owed, true).color}
            value={money(data.estimated_tax_owed)}
          />

          <SummaryRow
            label="Estimated reduction from deductions"
            color={reportImpact(data.estimated_tax_savings).color}
            value={money(data.estimated_tax_savings)}
            bold
          />
        </SummaryCard>

        <SummaryCard title="Important Notes">
          {data.tax_method === "standard_mileage" ? (
            <>
              <Text style={styles.note}>
                <Translated text={"• Vehicle expenses such as fuel, maintenance, repairs, insurance, registration, and car washes are included in the Standard Mileage deduction and are not deductible separately."} /></Text>

              {Object.keys(data.non_deductible_breakdown ?? {}).length > 0 && (
                <Text style={styles.note}>
                  <Translated text={"• Non-deductible vehicle expenses have been excluded from your deductible business expenses."} /></Text>
              )}
            </>
          ) : (
            <Text style={styles.note}>
              <Translated text={"• This report uses the Actual Expense method. Vehicle expenses have been deducted individually where applicable."} /></Text>
          )}

          <Text style={styles.note}>
            <Translated text={"• This summary is an estimate only and should not replace advice from a qualified tax professional."} /></Text>
        </SummaryCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  content: {
    padding: 20,
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 8,
  },
  label: {
    flexGrow: 1,
    flexBasis: 170,
    fontSize: 15,
    color: "#6B7280",
  },
  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 1,
  },
  bold: {
    fontWeight: "700",
    color: "#111827",
  },
  note: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4B5563",
  },
});