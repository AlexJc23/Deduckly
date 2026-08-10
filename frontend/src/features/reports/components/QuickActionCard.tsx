import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import { QuickActionButton } from "./QuickActionButton";
import { CurrentReport } from "../types/report.types";

type QuickActionCardProps = {
  report: CurrentReport;
  onExport: () => void;
};

export function QuickActionsCard({
  report,
  onExport,
}: QuickActionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            TOOLS
          </Text>

          <Text style={styles.title}>
            Quick Actions
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="flash-outline"
            size={17}
            color="#4A6FE3"
          />
        </View>
      </View>

      <View style={styles.row}>
        <QuickActionButton
          icon="download-outline"
          title="Export"
          subtitle="PDF / CSV"
          onPress={onExport}
        />

        <View style={styles.spacer} />

        <QuickActionButton
          icon="document-text-outline"
          title="IRS Summary"
          subtitle="Tax details"
          onPress={() =>
            router.push({
              pathname: "/reports/IrsSummary",
              params: {
                year: report.year,
                month: report.month,
                day: report.day,
              },
            })
          }
        />
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
    marginBottom: 14,
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

  row: {
    flexDirection: "row",
  },

  spacer: {
    width: 10,
  },
});