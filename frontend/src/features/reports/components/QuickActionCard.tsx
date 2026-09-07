import { View } from "@/theme/components";
import { StyleSheet } from "react-native";

import { router } from "expo-router";

import { QuickActionButton } from "./QuickActionButton";
import { UseCurrentReportParams } from "../hooks/use-current-report";
import { localDateString } from "../utils/report-display";
import { CurrentReport } from "../types/report.types";

type QuickActionCardProps = {
  report: CurrentReport;
  reportParams?: UseCurrentReportParams;
  onExport: () => void;
};

export function QuickActionsCard({
  report,
  onExport,
  reportParams,
}: QuickActionCardProps) {
  return (
    <View style={styles.card}>
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
          title="Tax summary"
          subtitle="Tax details"
          onPress={() =>
            router.push({
              pathname: "/reports/IrsSummary",
              params: reportParams?.startDate && reportParams?.endDate ? {
                startDate: localDateString(reportParams.startDate),
                endDate: localDateString(reportParams.endDate),
              } : { year: report.year, month: report.month, day: report.day },
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