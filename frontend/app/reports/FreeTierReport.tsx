import { useLanguage, Translated } from "@/i18n/language";
import { ScrollView, Text, View, SafeAreaView } from "@/theme/components";
import { StyleSheet } from "react-native";

import { useCurrentReport } from "@/features/reports/hooks/use-current-report";
import { formatReportDate, getCurrentMonthAndYear } from "@/features/reports/utils/date";
import { ReportBody } from "@/features/reports/components/ReportBody";
import { ReportLoadState, ReportSection } from "@/features/reports/components/ReportPresentation";
import PremiumButton from "@/components/ui/PremiumButton";
import { useMonthlyGoal } from "@/features/users/hooks/use-monthly-goal";
import { MonthlyIncomeGoalCard } from "@/features/reports/components/MonthlyIncomeGoal";
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function FreeTierReportScreen() {
  const { locale } = useLanguage();
  const isTablet = useIsTablet();
  const { year, month } = getCurrentMonthAndYear();
  const { data, isLoading, isError, refetch } = useCurrentReport({ year, month });
  const { data: monthlyGoal } = useMonthlyGoal();
  return <SafeAreaView edges={["top"]} style={s.screen}>
    <ScrollView contentContainerStyle={[s.content, isTablet && s.tablet]} showsVerticalScrollIndicator={false}>
      <View style={s.inner}>
        <Text accessibilityRole="header" style={s.title}><Translated text={"Reports"} /></Text>
        <Text style={s.period}>{formatReportDate(year, month, undefined, locale)} <Translated text={"· Month to date"} /></Text>
        <Text style={s.subtitle}><Translated text={"Income, spending, mileage, and estimates in one view."} /></Text>
          {monthlyGoal && monthlyGoal.goal > 0 && <ReportSection title=""><MonthlyIncomeGoalCard monthlyGoal={monthlyGoal} /></ReportSection>}
        {isLoading || isError || !data ? <ReportLoadState loading={isLoading} retry={() => void refetch()} /> : <>
          <ReportBody report={data} />
          <PremiumButton
            title="Put your numbers to work."
            message="Go beyond this month with reports you can explore, save, and share."
            features={["Review previous months and years", "Choose the dates that matter to you", "Export reports as PDF or CSV"]}
          />
        </>}
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#F6F8FB" }, content: { padding: 20, paddingBottom: 40 }, tablet: { padding: 34 }, inner: { width: "100%", maxWidth: 1000, alignSelf: "center" }, title: { fontSize: 32, fontWeight: "700", color: "#273449", letterSpacing: -0.7 }, period: { color: "#0072B5", fontSize: 16, fontWeight: "600", marginTop: 10 }, subtitle: { fontSize: 14, lineHeight: 21, color: "#64748B", marginTop: 8, marginBottom: 28 } });
