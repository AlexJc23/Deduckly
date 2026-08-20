import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";

import PremiumHeader from "@/features/reports/components/PremiumHeader";
import { OverviewCard } from "@/features/reports/components/OverViewCard";
import { ExpenseBreakdownCard } from "@/features/reports/components/ExpenseBreakdownCard";
import {
  ReportPeriod,
  ReportPeriodSelector,
} from "@/features/reports/components/ReportPeriodSelector";
import { ProfitSummaryCard } from "@/features/reports/components/ProfitSummaryCard";
import { QuickActionsCard } from "@/features/reports/components/QuickActionCard";
import { CustomReportModal } from "@/features/reports/modals/CustomReportModal";
import { ExportReportModal } from "@/features/reports/modals/ExportReportModal";
import { useCurrentReport } from "@/features/reports/hooks/use-current-report";
import { buildReportParams } from "@/features/reports/utils/build-report-params";
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function PremiumReportScreen() {
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const [selectedPeriod, setSelectedPeriod] =
    useState<ReportPeriod>("month");

  const [showCustomModal, setShowCustomModal] =
    useState(false);

  const [customRange, setCustomRange] = useState<{
    startDate?: Date;
    endDate?: Date;
  }>({});

  const [exportVisible, setExportVisible] =
    useState(false);

  const handlePeriodChange = (
    period: ReportPeriod,
  ) => {
    if (period === "custom") {
      setShowCustomModal(true);
      return;
    }

    setSelectedPeriod(period);
  };

  const reportParams =
    selectedPeriod === "custom"
      ? {
          startDate: customRange.startDate,
          endDate: customRange.endDate,
        }
      : buildReportParams(selectedPeriod);

  const { data, isLoading } =
    useCurrentReport(reportParams);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>
            —
          </Text>
        </View>

        <Text style={styles.emptyTitle}>
          No report available
        </Text>

        <Text style={styles.emptyText}>
          There isn't enough data to generate
          this report yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerInner}>
          <PremiumHeader
            onExport={() =>
              setExportVisible(true)
            }
          />

          <View style={styles.periodContainer}>
            <ReportPeriodSelector
              selected={selectedPeriod}
              onSelect={handlePeriodChange}
            />
          </View>
        </View>
      </View>

      {/* Scrollable Report */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentInner}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              OVERVIEW
            </Text>

            <OverviewCard report={data} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              PROFIT & TAX
            </Text>

            <ProfitSummaryCard
              report={data}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              EXPENSES
            </Text>

            <ExpenseBreakdownCard
              report={data}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              REPORT TOOLS
            </Text>

            <QuickActionsCard
              report={data}
              onExport={() =>
                setExportVisible(true)
              }
            />
          </View>
        </View>
      </ScrollView>

      <ExportReportModal
        report={data}
        visible={exportVisible}
        onClose={() =>
          setExportVisible(false)
        }
      />

      <CustomReportModal
        visible={showCustomModal}
        onClose={() =>
          setShowCustomModal(false)
        }
        onGenerate={(
          startDate,
          endDate,
        ) => {
          setCustomRange({
            startDate,
            endDate,
          });

          setSelectedPeriod("custom");
          setShowCustomModal(false);
        }}
      />
    </View>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: "#F6F8FB",
    },

    fixedHeader: {
      backgroundColor: "#F6F8FB",
      paddingHorizontal: isTablet ? 34 : 20,
      paddingTop: isTablet ? 28 : 86,
      paddingBottom: isTablet ? 20 : 12,
      borderBottomWidth: 1,
      borderBottomColor: "#E8ECF2",
      zIndex: 10,
    },

    headerInner: {
      width: "100%",
      maxWidth: isTablet ? 1050 : undefined,
      alignSelf: isTablet ? "center" : undefined,
    },

    periodContainer: {
      marginTop: isTablet ? 8 : 2,
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: isTablet ? 34 : 20,
      paddingTop: isTablet ? 28 : 20,
      paddingBottom: isTablet ? 60 : 50,
    },

    contentInner: {
      width: "100%",
      maxWidth: isTablet ? 1050 : undefined,
      alignSelf: isTablet ? "center" : undefined,
    },

    section: {
      marginBottom: isTablet ? 30 : 22,
    },

    sectionLabel: {
      marginLeft: 2,
      marginBottom: isTablet ? 12 : 9,
      fontSize: isTablet ? 11 : 9,
      fontWeight: "800",
      letterSpacing: 1.25,
      color: "#94A3B8",
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F6F8FB",
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: isTablet ? 60 : 30,
      backgroundColor: "#F6F8FB",
    },

    emptyIcon: {
      width: isTablet ? 60 : 46,
      height: isTablet ? 60 : 46,
      borderRadius: isTablet ? 18 : 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EEF2FF",
      borderWidth: 1,
      borderColor: "#DDE5FF",
      marginBottom: isTablet ? 18 : 14,
    },

    emptyIconText: {
      fontSize: isTablet ? 26 : 20,
      fontWeight: "700",
      color: "#4A6FE3",
    },

    emptyTitle: {
      fontSize: isTablet ? 22 : 17,
      fontWeight: "800",
      color: "#273449",
    },

    emptyText: {
      maxWidth: isTablet ? 360 : 280,
      marginTop: isTablet ? 8 : 6,
      fontSize: isTablet ? 15 : 13,
      lineHeight: isTablet ? 22 : 19,
      color: "#64748B",
      textAlign: "center",
    },
  });