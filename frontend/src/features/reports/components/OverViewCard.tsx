import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { CurrentReport } from "../types/report.types";

type OverviewCardProps = {
  report: CurrentReport;
};

export function OverviewCard({
  report,
}: OverviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            OVERVIEW
          </Text>

          <Text style={styles.title}>
            Your numbers
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="analytics-outline"
            size={17}
            color="#4A6FE3"
          />
        </View>
      </View>

      <View style={styles.grid}>
        <Metric
          icon="arrow-down-circle-outline"
          iconColor="#16A34A"
          label="Income"
          value={`$${Number(
            report.total_income ?? 0,
          ).toFixed(2)}`}
        />

        <Metric
          icon="arrow-up-circle-outline"
          iconColor="#DC2626"
          label="Expenses"
          value={`$${Number(
            report.total_expenses ?? 0,
          ).toFixed(2)}`}
        />

        <Metric
          icon="car-outline"
          iconColor="#4A6FE3"
          label="Miles"
          value={Number(
            report.total_miles ?? 0,
          ).toFixed(2)}
        />

        <Metric
          icon="receipt-outline"
          iconColor="#8B5CF6"
          label="Deductions"
          value={`$${Number(
            report.total_deductions ?? 0,
          ).toFixed(2)}`}
        />
      </View>
    </View>
  );
}

function Metric({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor: `${iconColor}12`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={iconColor}
        />
      </View>

      <View style={styles.metricContent}>
        <Text style={styles.label}>
          {label}
        </Text>

        <Text
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
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
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  metric: {
    width: "48%",
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },

  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  metricContent: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 3,
  },

  value: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
});