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
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function FreeTierReportScreen() {
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

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
        <View style={styles.headerInner}>
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
      </View>

      {/* Scrollable Report */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentInner}>
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
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: "#F6F8FB",
    },

    header: {
      backgroundColor: "#F6F8FB",
      paddingHorizontal: isTablet ? 34 : 20,
      paddingTop: isTablet ? 30 : 66,
      paddingBottom: isTablet ? 24 : 18,
      borderBottomWidth: 1,
      borderBottomColor: "#E8ECF2",
      zIndex: 10,
    },

    headerInner: {
      width: "100%",
      maxWidth: isTablet ? 1050 : undefined,
      alignSelf: isTablet ? "center" : undefined,
    },

    eyebrow: {
      fontSize: isTablet ? 11 : 9,
      fontWeight: "800",
      letterSpacing: 1.25,
      color: "#94A3B8",
      marginBottom: isTablet ? 6 : 4,
    },

    title: {
      fontSize: isTablet ? 36 : 27,
      lineHeight: isTablet ? 43 : 33,
      fontWeight: "800",
      letterSpacing: -0.7,
      color: "#273449",
    },

    subtitle: {
      marginTop: isTablet ? 7 : 5,
      fontSize: isTablet ? 15 : 13,
      lineHeight: isTablet ? 22 : 19,
      color: "#64748B",
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: isTablet ? 34 : 20,
      paddingTop: isTablet ? 28 : 20,
      paddingBottom: isTablet ? 60 : 50,
    },

    contentInner: {
      width: "100%",
      maxWidth: isTablet ? 1050 : undefined,
      alignSelf: isTablet ? "center" : undefined,
    },

    section: {
      marginBottom: isTablet ? 30 : 22,
    },

    sectionLabel: {
      marginLeft: 2,
      marginBottom: isTablet ? 12 : 9,
      fontSize: isTablet ? 11 : 9,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: "#94A3B8",
    },

    proSection: {
      marginTop: isTablet ? 6 : 2,
      marginBottom: isTablet ? 16 : 10,
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
      paddingHorizontal: isTablet ? 60 : 30,
      backgroundColor: "#F6F8FB",
    },

    errorTitle: {
      fontSize: isTablet ? 22 : 17,
      fontWeight: "800",
      color: "#273449",
    },

    errorText: {
      marginTop: 8,
      fontSize: isTablet ? 15 : 13,
      lineHeight: isTablet ? 22 : 19,
      color: "#64748B",
      textAlign: "center",
    },
  });