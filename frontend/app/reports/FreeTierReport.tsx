import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useCurrentReport } from "@/features/reports/hooks/use-current-report";
import { formatReportDate, getCurrentMonthAndYear } from "@features/reports/utils/date";
import { ReportSummaryCard } from "@features/reports/components/ReportSummaryCard"
import { TaxCard } from "@/features/reports/components/TaxCard";
import { ExpenseBreakdownCard } from "@/features/reports/components/ExpenseBreakdownCard";
import PremiumButton from "@/components/ui/PremiumButton";
import { useMonthlyGoal } from "@/features/users/hooks/use-monthly-goal";
import { MonthlyIncomeGoalCard } from "@/features/reports/components/MonthlyIncomeGoal";





export default function FreeTierReportScreen() {
  const { year, month, day } = getCurrentMonthAndYear();

  const { data, isLoading } = useCurrentReport({
    year: year,
    month: month
  });


  const { data: monthlyGoal } =
      useMonthlyGoal();


  let date = formatReportDate(year, month)

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollView style={{
        flex: 1,
        padding: 20,
        backgroundColor: "#FFF",
      }}>
      <View>
        <Text>{date}</Text>
      </View>
      <View>
        <Text>Summary</Text>
        <ReportSummaryCard report={data} />
      </View>
      <View>
        <Text>Taxes</Text>
        <TaxCard report={data} />
      </View>
      {monthlyGoal && (
        <MonthlyIncomeGoalCard
          monthlyGoal={monthlyGoal}
        />
      )}
      <View>
        <Text>Expense Breakdown</Text>
        <ExpenseBreakdownCard report={data} />
      </View>
      <View>
        <PremiumButton 
          title="Deduckly Pro" 
          message="You're only seeing the basics. Upgrade to unlock powerful insights into your business performance." 
        />
      </View>
    </ScrollView>
  );
}