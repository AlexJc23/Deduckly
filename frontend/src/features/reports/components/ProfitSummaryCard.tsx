import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { CurrentReport } from "../types/report.types";

type ProfitSummaryCardProps = {
  report: CurrentReport;
};

export function ProfitSummaryCard({
  report,
}: ProfitSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            PROFIT SUMMARY
          </Text>

          <Text style={styles.title}>
            Where you stand
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="trending-up-outline"
            size={17}
            color="#16A34A"
          />
        </View>
      </View>

      <View style={styles.profitRow}>
        <View style={styles.profitIcon}>
          <Ionicons
            name="wallet-outline"
            size={19}
            color="#16A34A"
          />
        </View>

        <View style={styles.profitContent}>
          <Text style={styles.label}>
            Net Profit
          </Text>

          <Text style={styles.profitValue}>
            $
            {Number(
              report.net_profit ?? 0,
            ).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Ionicons
              name="calculator-outline"
              size={15}
              color="#DC2626"
            />
          </View>

          <Text style={styles.label}>
            Est. Tax Owed
          </Text>

          <Text style={styles.statValue}>
            $
            {Number(
              report.estimated_tax_owed ?? 0,
            ).toFixed(2)}
          </Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.stat}>
          <View
            style={[
              styles.statIcon,
              styles.savingsIcon,
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#16A34A"
            />
          </View>

          <Text style={styles.label}>
            Est. Tax Saved
          </Text>

          <Text
            style={[
              styles.statValue,
              styles.savingsValue,
            ]}
          >
            $
            {Number(
              report.estimated_tax_savings ?? 0,
            ).toFixed(2)}
          </Text>
        </View>
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
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#94A3B8",
    marginBottom: 2,
  },

  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },

  profitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 13,
  },

  profitIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  profitContent: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },

  profitValue: {
    marginTop: 2,
    fontSize: 23,
    fontWeight: "800",
    color: "#15803D",
    letterSpacing: -0.4,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
  },

  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  savingsIcon: {
    backgroundColor: "#ECFDF5",
  },

  statValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "800",
    color: "#DC2626",
  },

  savingsValue: {
    color: "#16A34A",
  },

  verticalDivider: {
    width: 1,
    height: 54,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 14,
  },
});