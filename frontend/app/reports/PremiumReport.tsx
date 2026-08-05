import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
} from "react-native";

import PremiumHeader from "@/features/reports/components/PremiumHeader";
import { OverviewCard } from "@/features/reports/components/OverViewCard";
import { ExpenseBreakdownCard } from "@/features/reports/components/ExpenseBreakdownCard";
import { MonthlyIncomeGoalCard } from "@/features/reports/components/MonthlyIncomeGoal";
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
import { useMonthlyGoal } from "@/features/users/hooks/use-monthly-goal";

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

  const { data: monthlyGoal } =
    useMonthlyGoal();

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

        {/* {monthlyGoal && (
          <MonthlyIncomeGoalCard
            monthlyGoal={monthlyGoal}
          />
        )} */}

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