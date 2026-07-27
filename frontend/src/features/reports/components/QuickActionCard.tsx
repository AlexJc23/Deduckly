import { StyleSheet, Text, View } from "react-native";
import { QuickActionButton } from "./QuickActionButton";
import { CurrentReport } from "../types/report.types";
import { router } from "expo-router";

type QuickActionCardProps = {
    report: CurrentReport;
    onExport: () => void;

};

export function QuickActionsCard({
    report,
    onExport
}: QuickActionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Quick Actions
      </Text>

      <View style={styles.row}>
        <QuickActionButton
          icon="download-outline"
          title="Export"
          subtitle="PDF / CSV"
          onPress={onExport}
        />

        <View style={{ width: 12 }} />

        <QuickActionButton
                  title="IRS Summary"
                  onPress={() => router.push({
                      pathname: "/reports/IrsSummary",
                      params: {
                          year: report.year,
                          month: report.month,
                          day: report.day
                      },
                  })} icon={"filter"} subtitle={""}        />

        <View style={{ width: 12 }} />

        {/* <QuickActionButton
          icon="share-social-outline"
          title="Share Report"
          subtitle="Send PDF"
          onPress={() => {}}
        /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
  },

  heading: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
  },
});