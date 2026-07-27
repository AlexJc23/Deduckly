import { View, Text } from "react-native";
import { CurrentReport } from "../types/report.types";


type ProfitSummaryCardProps = {
  report: CurrentReport;
};

export function ProfitSummaryCard({
    report,
}: ProfitSummaryCardProps) {
    return (
        <View>
            <View>
                <View>
                    <Text>Net Profit</Text>
                    <Text>${report.net_profit}</Text>
                </View>
            </View>
            <View>
                <View>
                    <Text>Est. Tax Owed</Text>
                    <Text>${report.estimated_tax_owed}</Text>
                </View>
            </View>
            <View>
                <View>
                    <Text>Est. Tax Saved</Text>
                    <Text>${report.estimated_tax_savings}</Text>
                </View>
            </View>
        </View>
    );
}