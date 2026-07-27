import { View, Text } from "react-native";
import { CurrentReport } from "../types/report.types";
import React from "react";
import { ExpensePieChart } from "./ExpensePieChart";


type ReportSummaryCardProps = {
  report: CurrentReport;
};

export function ExpenseBreakdownCard({
  report,
}: ReportSummaryCardProps) {
  return (
    <View>
      <Text>Expense Breakdown</Text>
      <View>
      <ExpensePieChart
        expenseBreakdown={report.expense_breakdown}
        />
        </View>
    </View>
  );
}