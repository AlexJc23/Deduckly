import {
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState } from "react";

import PremiumHeader from "@/features/reports/components/PremiumHeader";
import {
  ReportPeriod,
  ReportPeriodSelector,
} from "@/features/reports/components/ReportPeriodSelector";
import { OverviewCard } from "@/features/reports/components/OverViewCard";
import { ExpenseBreakdownCard } from "@/features/reports/components/ExpenseBreakdownCard";
import { ProfitSummaryCard } from "@/features/reports/components/ProfitSummaryCard";
import { WeeklyIncomeGoalCard } from "@/features/reports/components/WeeklyIncomeGoal";
import { QuickActionsCard } from "@/features/reports/components/QuickActionCard";

import { ExportReportModal } from "@/features/reports/modals/ExportReportModal";
import { CustomReportModal } from "@/features/reports/modals/CustomReportModal";

import { useCurrentReport } from "@/features/reports/hooks/use-current-report";
import { useWeeklyGoal } from "@/features/users/hooks/use-weekly-goal";

import { buildReportParams } from "@/features/reports/utils/build-report-params";

export default function PremiumReportScreen() {
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
    period: ReportPeriod
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

  const { data: weeklyGoal } =
    useWeeklyGoal();

  if (!data || isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#FFF",
        }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 90,
          paddingBottom: 40,
          gap: 16,
        }}
      >
        <PremiumHeader />

        <ReportPeriodSelector
          selected={selectedPeriod}
          onSelect={handlePeriodChange}
        />

        {weeklyGoal && (
          <WeeklyIncomeGoalCard
            weeklyGoal={weeklyGoal}
          />
        )}

        <OverviewCard report={data} />

        <ExpenseBreakdownCard
          report={data}
        />

        <ProfitSummaryCard
          report={data}
        />

        <QuickActionsCard
          report={data}
          onExport={() =>
            setExportVisible(true)
          }
        />
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
        onGenerate={(startDate, endDate) => {
          setCustomRange({
            startDate,
            endDate,
          });

          setSelectedPeriod("custom");
          setShowCustomModal(false);
        }}
      />
    </>
  );
}