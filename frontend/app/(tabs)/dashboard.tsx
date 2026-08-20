import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { MonthlyIncomeGoalCard } from "@/features/reports/components/MonthlyIncomeGoal";
import { useCurrentReport } from "@/features/reports/hooks/use-current-report";
import { useTodayReport } from "@/features/reports/hooks/use-today-report";
import { getCurrentMonthAndYear } from "@/features/reports/utils/date";
import { StartTripModal } from "@/features/tracking/components/StartTripModal";
import { useTracking } from "@/features/tracking/context/tracking.context";
import { useMonthlyGoal } from "@/features/users/hooks/use-monthly-goal";
import { getPendingTrip } from "@/services/siri.service";
import { useIsTablet } from "@/hooks/use-is-tablet";

const subtitles = [
  "Making taxes slightly less terrible.",
  "Your accountant would be proud.",
  "The IRS hates this app.",
  "Adulting, unfortunately.",
  "Because guessing isn't bookkeeping.",
  "Finding money you already earned.",
  "The numbers don't judge.",
  "Money in. Stress out.",
  "Less paperwork. More driving.",
  "Turning 'I think...' into 'I know.'",
  "Every mile has a story.",
];

export default function DashboardScreen() {
  const userQuery = useCurrentUser();
  const { saved } = useLocalSearchParams();
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const {
    isTracking,
    startTrackingFromSiri,
  } = useTracking();

  const [showStartTripModal, setShowStartTripModal] =
    useState(false);

  const [showBanner, setShowBanner] =
    useState(false);

  const bannerTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: monthlyGoal } =
    useMonthlyGoal();

  const { year, month } =
    getCurrentMonthAndYear();

  const {
    data: todayReport,
    isLoading: todayLoading,
  } = useTodayReport();

  const {
    data: monthlyReport,
    isLoading: monthlyLoading,
  } = useCurrentReport({
    year,
    month,
  });

  const estimatedTaxOwed =
    monthlyReport?.estimated_tax_owed.toFixed(2) ?? "--";

  const estimatedTaxSavings =
    monthlyReport?.estimated_tax_savings.toFixed(2) ?? "--";

  const todayMiles =
    todayReport?.total_miles.toFixed(2) ?? "--";

  const todayExpenses =
    todayReport?.total_expenses.toFixed(2) ?? "--";

  const openStartModal = useCallback(
    () => setShowStartTripModal(true),
    []
  );

  const closeStartModal = useCallback(
    () => setShowStartTripModal(false),
    []
  );

  const [subtitle] = useState(
    () =>
      subtitles[
        Math.floor(
          Math.random() * subtitles.length
        )
      ]
  );

  const greeting = (() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  })();

  useEffect(() => {
    if (saved !== "true") {
      return;
    }

    setShowBanner(true);

    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }

    bannerTimeoutRef.current = setTimeout(() => {
      setShowBanner(false);
      bannerTimeoutRef.current = null;
    }, 3000);

    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current);
      }
    };
  }, [saved]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const pendingTrip =
        await getPendingTrip();

      if (!pendingTrip) return;

      clearInterval(interval);

      await startTrackingFromSiri(
        pendingTrip.platform
      );

      router.replace(
        "/tracking/active"
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (monthlyLoading || todayLoading) {
    return (
      <SafeAreaView
        style={styles.loadingScreen}
      >
        <ActivityIndicator
          size="small"
          color="#4A6FE3"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      {showBanner && (
        <View style={styles.banner}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.bannerText}>
            Trip Saved Successfully
          </Text>
        </View>
      )}

      {userQuery.data && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            <Text style={styles.welcomeLight}>
              {greeting}
            </Text>{" "}
            <Text style={styles.welcomeName}>
              {userQuery.data.first_name}!
            </Text>
          </Text>

          <Text style={styles.welcomeSubtitle}>
            {subtitle}
          </Text>
        </View>
      )}

      {monthlyGoal && (
        <View style={styles.goalContainer}>
          <MonthlyIncomeGoalCard
            monthlyGoal={monthlyGoal}
          />
        </View>
      )}

      <View style={styles.taxCard}>
        <View style={styles.taxHeader}>
          <View style={styles.taxIcon}>
            <Ionicons
              name="calculator-outline"
              size={isTablet ? 22 : 18}
              color="#4A6FE3"
            />
          </View>

          <Text style={styles.taxLabel}>
            ESTIMATED TAXES
          </Text>
        </View>

        <Text style={styles.taxAmount}>
          ${estimatedTaxOwed}
        </Text>

        <Text style={styles.taxHint}>
          Estimated taxes this month
        </Text>

        <View style={styles.taxSavingsRow}>
          <View style={styles.savingsIcon}>
            <Ionicons
              name="trending-down-outline"
              size={isTablet ? 17 : 15}
              color="#22C55E"
            />
          </View>

          <Text style={styles.taxSavingsText}>
            ${estimatedTaxSavings} saved
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.offerAnalyzerButton,
          pressed &&
            styles.offerAnalyzerButtonPressed,
        ]}
        onPress={() =>
          router.push(
            "/offer-analyzer/screens/OfferAnalyzerScreen"
          )
        }
      >
        <View style={styles.offerIcon}>
          <Ionicons
            name="analytics-outline"
            size={isTablet ? 24 : 20}
            color="#4A6FE3"
          />
        </View>

        <View style={styles.offerTextContainer}>
          <Text style={styles.offerTitle}>
            Offer Analyzer
          </Text>

          <Text style={styles.offerSubtitle}>
            See if a gig is worth your time
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={isTablet ? 22 : 19}
          color="#64748B"
        />
      </Pressable>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons
              name="speedometer-outline"
              size={isTablet ? 21 : 17}
              color="#4A6FE3"
            />
          </View>

          <Text style={styles.metricValue}>
            {todayMiles}
          </Text>

          <Text style={styles.metricLabel}>
            miles today
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons
              name="receipt-outline"
              size={isTablet ? 21 : 17}
              color="#F4B942"
            />
          </View>

          <Text style={styles.metricValue}>
            ${todayExpenses}
          </Text>

          <Text style={styles.metricLabel}>
            expenses
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.actionButtonsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed &&
                styles.actionButtonPressed,
            ]}
            onPress={() =>
              router.push("/income/create")
            }
          >
            <Ionicons
              name="add-circle-outline"
              size={isTablet ? 21 : 18}
              color="#4A6FE3"
            />

            <Text style={styles.actionButtonText}>
              Add Income
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed &&
                styles.actionButtonPressed,
            ]}
            onPress={() =>
              router.push("/expense/create")
            }
          >
            <Ionicons
              name="receipt-outline"
              size={isTablet ? 21 : 18}
              color="#64748B"
            />

            <Text style={styles.actionButtonText}>
              Add Expense
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={
            !isTracking
              ? openStartModal
              : () =>
                  router.push(
                    "/tracking/active"
                  )
          }
          style={({ pressed }) => [
            styles.startTripButton,
            isTracking &&
              styles.startTripButtonTracking,
            pressed &&
              !isTracking &&
              styles.startTripButtonPressed,
          ]}
        >
          <Ionicons
            name={
              isTracking
                ? "navigate"
                : "play"
            }
            size={isTablet ? 22 : 19}
            color={
              isTracking
                ? "#64748B"
                : "#FFFFFF"
            }
          />

          <Text
            style={[
              styles.startTripButtonText,
              isTracking &&
                styles.startTripButtonTextTracking,
            ]}
          >
            {isTracking
              ? "Trip in Progress"
              : "Start Trip"}
          </Text>

          {!isTracking && (
            <Ionicons
              name="chevron-forward"
              size={isTablet ? 21 : 18}
              color="#FFFFFF"
            />
          )}
        </Pressable>
      </View>

      <StartTripModal
        visible={showStartTripModal}
        onClose={closeStartModal}
      />
    </SafeAreaView>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      paddingHorizontal: isTablet ? 28 : 20,
      backgroundColor: "#F8FAFC",
    },

    loadingScreen: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F8FAFC",
    },

    banner: {
      position: "absolute",
      top: isTablet ? 18 : 50,
      left: isTablet ? 28 : 8,
      right: isTablet ? 28 : 8,
      zIndex: 1000,

      minHeight: isTablet ? 56 : 52,
      paddingHorizontal: isTablet ? 20 : 18,
      borderRadius: isTablet ? 16 : 16,

      backgroundColor: "#3559C7",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,

      shadowColor: "#244181",
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 5,
    },

    bannerText: {
      color: "#FFFFFF",
      fontSize: isTablet ? 15 : 14,
      fontWeight: "700",
    },

    welcomeContainer: {
      marginTop: isTablet ? 24 : 8,
      marginBottom: isTablet ? 24 : 20,
      maxWidth: isTablet ? 1000 : undefined,
      alignSelf: isTablet ? "center" : undefined,
      width: isTablet ? "100%" : undefined,
    },

    welcomeText: {
      fontSize: isTablet ? 34 : 28,
      letterSpacing: -0.8,
    },

    welcomeLight: {
      color: "#64748B",
      fontWeight: "500",
    },

    welcomeName: {
      color: "#111827",
      fontWeight: "800",
    },

    welcomeSubtitle: {
      marginTop: 6,
      fontSize: isTablet ? 15 : 14,
      lineHeight: isTablet ? 22 : 20,
      color: "#64748B",
      fontWeight: "500",
    },

    goalContainer: {
      maxWidth: isTablet ? 1000 : undefined,
      alignSelf: isTablet ? "center" : undefined,
      width: isTablet ? "100%" : undefined,
      marginBottom: isTablet ? 4 : 0,
    },

    taxCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet ? 20 : 18,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      padding: isTablet ? 22 : 18,
      marginTop: isTablet ? 18 : 16,
      maxWidth: isTablet ? 1000 : undefined,
      alignSelf: isTablet ? "center" : undefined,
      width: isTablet ? "100%" : undefined,

      shadowColor: "#111827",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
    },

    taxHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    taxIcon: {
      width: isTablet ? 38 : 32,
      height: isTablet ? 38 : 32,
      borderRadius: isTablet ? 11 : 10,
      backgroundColor: "#DCE6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    taxLabel: {
      fontSize: isTablet ? 11 : 10,
      fontWeight: "800",
      letterSpacing: 1.1,
      color: "#64748B",
    },

    taxAmount: {
      marginTop: isTablet ? 14 : 12,
      fontSize: isTablet ? 34 : 30,
      lineHeight: isTablet ? 41 : 36,
      fontWeight: "800",
      letterSpacing: -0.7,
      color: "#111827",
    },

    taxHint: {
      marginTop: 3,
      fontSize: isTablet ? 13 : 12,
      color: "#64748B",
    },

    taxSavingsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: isTablet ? 18 : 16,
      paddingTop: isTablet ? 14 : 13,
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
    },

    savingsIcon: {
      width: isTablet ? 28 : 26,
      height: isTablet ? 28 : 26,
      borderRadius: isTablet ? 9 : 8,
      backgroundColor: "#DCFCE7",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    taxSavingsText: {
      fontSize: isTablet ? 14 : 13,
      fontWeight: "700",
      color: "#22C55E",
    },

    offerAnalyzerButton: {
      minHeight: isTablet ? 76 : 68,
      marginTop: isTablet ? 16 : 14,
      paddingHorizontal: isTablet ? 18 : 14,
      paddingVertical: isTablet ? 14 : 12,
      borderRadius: isTablet ? 18 : 16,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      flexDirection: "row",
      alignItems: "center",
      maxWidth: isTablet ? 1000 : undefined,
      alignSelf: isTablet ? "center" : undefined,
      width: isTablet ? "100%" : undefined,

      shadowColor: "#111827",
      shadowOpacity: 0.035,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 1,
    },

    offerAnalyzerButtonPressed: {
      backgroundColor: "#F1F5F9",
      transform: [{ scale: 0.985 }],
    },

    offerIcon: {
      width: isTablet ? 46 : 40,
      height: isTablet ? 46 : 40,
      borderRadius: isTablet ? 14 : 12,
      backgroundColor: "#DCE6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    offerTextContainer: {
      flex: 1,
      marginLeft: isTablet ? 14 : 12,
    },

    offerTitle: {
      fontSize: isTablet ? 17 : 15,
      fontWeight: "700",
      color: "#111827",
    },

    offerSubtitle: {
      marginTop: 2,
      fontSize: isTablet ? 13 : 12,
      color: "#64748B",
    },

    metricRow: {
      flexDirection: "row",
      gap: isTablet ? 14 : 12,
      marginTop: isTablet ? 14 : 12,
      maxWidth: isTablet ? 1000 : undefined,
      alignSelf: isTablet ? "center" : undefined,
      width: isTablet ? "100%" : undefined,
    },

    metricCard: {
      flex: 1,
      minHeight: isTablet ? 112 : 92,
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet ? 18 : 16,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      padding: isTablet ? 18 : 14,

      shadowColor: "#111827",
      shadowOpacity: 0.03,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 1,
    },

    metricIcon: {
      width: isTablet ? 34 : 30,
      height: isTablet ? 34 : 30,
      borderRadius: isTablet ? 10 : 9,
      backgroundColor: "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
    },

    metricValue: {
      marginTop: isTablet ? 10 : 8,
      fontSize: isTablet ? 21 : 18,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: "#111827",
    },

    metricLabel: {
      marginTop: 2,
      fontSize: isTablet ? 12 : 11,
      fontWeight: "600",
      color: "#64748B",
    },

    actionsContainer: {
      marginTop: "auto",
      marginBottom: isTablet ? 28 : 18,
      paddingTop: isTablet ? 24 : 14,
      maxWidth: isTablet ? 1000 : undefined,
      alignSelf: isTablet ? "center" : undefined,
      width: isTablet ? "100%" : undefined,
    },

    actionButtonsRow: {
      flexDirection: "row",
      gap: isTablet ? 14 : 10,
    },

    actionButton: {
      flex: 1,
      minHeight: isTablet ? 58 : 46,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet ? 15 : 12,
      paddingHorizontal: isTablet ? 16 : 12,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      gap: 7,
    },

    actionButtonPressed: {
      backgroundColor: "#F8FAFC",
      transform: [{ scale: 0.98 }],
    },

    actionButtonText: {
      fontSize: isTablet ? 14 : 13,
      fontWeight: "700",
      color: "#334155",
    },

    startTripButton: {
      marginTop: isTablet ? 14 : 12,
      minHeight: isTablet ? 66 : 56,
      borderRadius: isTablet ? 18 : 16,
      backgroundColor: "#4A6FE3",
      paddingHorizontal: isTablet ? 20 : 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,

      shadowColor: "#4A6FE3",
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 4,
    },

    startTripButtonPressed: {
      backgroundColor: "#3559C7",
      transform: [{ scale: 0.985 }],
    },

    startTripButtonTracking: {
      backgroundColor: "#E2E8F0",
      shadowOpacity: 0,
      elevation: 0,
    },

    startTripButtonText: {
      color: "#FFFFFF",
      fontSize: isTablet ? 18 : 16,
      fontWeight: "700",
    },

    startTripButtonTextTracking: {
      color: "#475569",
    },
  });