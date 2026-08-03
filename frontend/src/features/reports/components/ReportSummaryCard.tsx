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
            <Text>${report.total_income?.toFixed(2)}</Text>
        </View>
        <View>
            <Text>Expenses</Text>
            <Text>${report.total_expenses?.toFixed(2)}</Text>
        </View>
        <View>
            <Text>Net Profit</Text>
            <Text>${report.net_profit?.toFixed(2)}</Text>
        </View>
        <View>
            <Text>Total Miles</Text>
            <Text>${report.total_miles?.toFixed(2)}</Text>
        </View>
        <View>
            <Text>Mileage Deduction</Text>
            <Text>${report.mileage_deduction?.toFixed(2)}</Text>
        </View>

      <Text>{report.total_miles?.toFixed(2)}</Text>
    </View>
  );
}