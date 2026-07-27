import { View, Text } from "react-native";
import { CurrentReport } from "../types/report.types";

type OverViewCardProps = {
    report: CurrentReport
};

export function OverviewCard({
    report,
}: OverViewCardProps) {
    return (
        <View>
            <View>
                <Text>
                    Overview
                </Text>
            </View>
            <View>
                {/* {icon} */}
                <Text>
                    ${report.total_income}
                </Text>
            </View>
            <View>
                {/* {icon} */}
                <Text>
                    ${report.total_expenses}
                </Text>
            </View>
            <View>
                {/* {icon} */}
                <Text>
                    ${report.total_miles}
                </Text>
            </View>
            <View>
                {/* {icon} */}
                <Text>
                    ${report.total_deductions}
                </Text>
            </View>
        </View>
    )
}