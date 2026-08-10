import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCurrentReport } from "@/features/reports/hooks/use-current-report";
import {
  formatReportDate,
  getCurrentMonthAndYear,
} from "@features/reports/utils/date";

import { ReportSummaryCard } from "@features/reports/components/ReportSummaryCard";
import { TaxCard } from "@/features/reports/components/TaxCard";
import { ExpenseBreakdownCard } from "@/features/reports/components/ExpenseBreakdownCard";
import PremiumButton from "@/components/ui/PremiumButton";
import { useMonthlyGoal } from "@/features/users/hooks/use-monthly-goal";
import { MonthlyIncomeGoalCard } from "@/features/reports/components/MonthlyIncomeGoal";

export default function FreeTierReportScreen() {
  const { year, month } =
    getCurrentMonthAndYear();

  const {
    data,
    isLoading,
    isError,
  } = useCurrentReport({
    year,
    month,
  });

  const { data: monthlyGoal } =
    useMonthlyGoal();

  const date = formatReportDate(
    year,
    month,
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Unable to load report
        </Text>

        <Text style={styles.errorText}>
          We couldn't load your report data.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Fixed Header */}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          MONTHLY REPORT
        </Text>

        <Text style={styles.title}>
          {date}
        </Text>

        <Text style={styles.subtitle}>
          Here's how you're doing this month.
        </Text>
      </View>

      {/* Scrollable Report */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Monthly Goal */}

        {monthlyGoal && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              MONTHLY GOAL
            </Text>

            <MonthlyIncomeGoalCard
              monthlyGoal={monthlyGoal}
            />
          </View>
        )}

        {/* Summary */}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            SUMMARY
          </Text>

          <ReportSummaryCard
            report={data}
          />
        </View>

        {/* Taxes */}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            TAXES
          </Text>

          <TaxCard report={data} />
        </View>

        {/* Expense Breakdown */}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            EXPENSES
          </Text>

          <ExpenseBreakdownCard
            report={data}
          />
        </View>

        {/* Pro */}

        <View style={styles.proSection}>
          <PremiumButton
            title="Unlock Deduckly Pro"
            message="You're only seeing the basics. Upgrade to unlock powerful insights into your business performance."
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },

  header: {
    backgroundColor: "#F6F8FB",
    paddingHorizontal: 20,
    paddingTop: 66,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
    zIndex: 10,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#94A3B8",
    marginBottom: 4,
  },

  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#273449",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
  },

  section: {
    marginBottom: 22,
  },

  sectionLabel: {
    marginLeft: 2,
    marginBottom: 9,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#94A3B8",
  },

  proSection: {
    marginTop: 2,
    marginBottom: 10,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F8FB",
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F6F8FB",
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#273449",
  },

  errorText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
  },
});