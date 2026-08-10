import { View, Text, StyleSheet } from "react-native";
import { CurrentReport } from "../types/report.types";

type ReportSummaryCardProps = {
  report: CurrentReport;
};

export function ReportSummaryCard({
  report,
}: ReportSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>
          Income
        </Text>

        <Text style={styles.value}>
          ${report.total_income?.toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>
          Expenses
        </Text>

        <Text style={styles.value}>
          ${report.total_expenses?.toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>
          Net Profit
        </Text>

        <Text style={styles.value}>
          ${report.net_profit?.toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>
          Total Miles
        </Text>

        <Text style={styles.value}>
          {report.total_miles?.toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>
          Mileage Deduction
        </Text>

        <Text style={styles.value}>
          ${report.mileage_deduction?.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
    gap: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },

  value: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
});