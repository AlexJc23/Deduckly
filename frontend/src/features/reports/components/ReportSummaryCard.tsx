import { View, Text } from "react-native";
import { CurrentReport } from "../types/report.types";


type ReportSummaryCardProps = {
  report: CurrentReport;
};

export function ReportSummaryCard({
  report,
}: ReportSummaryCardProps) {
  return (
    <View>
        <View>
            <Text>Income</Text>
            <Text>${report.total_income}</Text>
        </View>
        <View>
            <Text>Expenses</Text>
            <Text>${report.deductible_expense_total}</Text>
        </View>
        <View>
            <Text>Net Profit</Text>
            <Text>${report.net_profit}</Text>
        </View>
        <View>
            <Text>Total Miles</Text>
            <Text>${report.total_miles}</Text>
        </View>
        <View>
            <Text>Mileage Deduction</Text>
            <Text>${report.mileage_deduction}</Text>
        </View>

      <Text>{report.total_miles}</Text>
    </View>
  );
}