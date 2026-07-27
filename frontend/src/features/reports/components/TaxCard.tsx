import { View, Text } from "react-native";
import { CurrentReport } from "../types/report.types";


type ReportSummaryCardProps = {
    report: CurrentReport;
};

export function TaxCard({ report }: ReportSummaryCardProps) {
    return (
        <View>
            <View>
                <Text>Estimated Tax Owed</Text>
                <Text>{report.estimated_tax_owed}</Text>
            </View>
            <View>
                <Text>Estimated Tax Savings</Text>
                <Text>{report.estimated_tax_savings}</Text>
            </View>
        </View>
    );
}