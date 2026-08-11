import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { CurrentReport } from "../types/report.types";

type ReportSummaryCardProps = {
  report: CurrentReport;
};

export function TaxCard({
  report,
}: ReportSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>
            Estimated Tax Owed
          </Text>

          <Text style={styles.subtext}>
            Based on your current taxable income
          </Text>
        </View>

        <Text style={styles.taxOwed}>
          $
          {report.estimated_tax_owed?.toFixed(
            2,
          )}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>
            Estimated Tax Savings
          </Text>

          <Text style={styles.subtext}>
            From your tracked deductions
          </Text>
        </View>

        <Text style={styles.savings}>
          $
          {report.estimated_tax_savings?.toFixed(
            2,
          )}
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
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  subtext: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },

  taxOwed: {
    fontSize: 19,
    fontWeight: "800",
    color: "#DC2626",
  },

  savings: {
    fontSize: 19,
    fontWeight: "800",
    color: "#16A34A",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
});