import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { BackHeader } from "@/components/ui/BackButton";
import { useCurrentReport } from "@/features/reports/hooks/use-current-report";

function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

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
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, bold && styles.bold]}>
        {label}
      </Text>

      <Text style={[styles.value, bold && styles.bold]}>
        {value}
      </Text>
    </View>
  );
}

export default function IrsSummaryScreen() {
  const { year, month, day } = useLocalSearchParams();

  const { data, isLoading } = useCurrentReport({
    year: year ? Number(year) : undefined,
    month: month ? Number(month) : undefined,
    day: day ? Number(day) : undefined,
  });

  if (isLoading || !data) {
    return (
      <View style={styles.container}>
        <BackHeader />
      </View>
    );
  }

  const reportPeriod = data.day
    ? `${data.month}/${data.day}/${data.year}`
    : data.month
    ? `${data.month}/${data.year}`
    : `${data.year}`;

  return (
    <View style={styles.container}>
      <BackHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>IRS Summary</Text>

        <Text style={styles.subtitle}>
          A simplified summary of your tax information.
        </Text>

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
                label="Business Expenses"
                value={money(data.deductible_expense_total)}
              />
            </>
          ) : (
            <>
              {Object.entries(data.deductible_breakdown).map(
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

        <SummaryCard title="Tax Summary">
          <SummaryRow
            label="Net Profit"
            value={money(data.net_profit)}
          />

          <SummaryRow
            label="Taxable Income"
            value={money(data.taxable_income)}
          />

          <SummaryRow
            label="Estimated Tax Owed"
            value={money(data.estimated_tax_owed)}
          />

          <SummaryRow
            label="Estimated Tax Savings"
            value={money(data.estimated_tax_savings)}
            bold
          />
        </SummaryCard>

        <SummaryCard title="Important Notes">
          {data.tax_method === "standard_mileage" ? (
            <>
              <Text style={styles.note}>
                • Vehicle expenses such as fuel, maintenance, repairs,
                insurance, registration, and car washes are included in the
                Standard Mileage deduction and are not deductible separately.
              </Text>

              {Object.keys(data.non_deductible_breakdown).length > 0 && (
                <Text style={styles.note}>
                  • Non-deductible vehicle expenses have been excluded from your
                  deductible business expenses.
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.note}>
              • This report uses the Actual Expense method. Vehicle expenses
              have been deducted individually where applicable.
            </Text>
          )}

          <Text style={styles.note}>
            • This summary is an estimate only and should not replace advice
            from a qualified tax professional.
          </Text>
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
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: "#6B7280",
  },
  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
    textAlign: "right",
    marginLeft: 12,
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