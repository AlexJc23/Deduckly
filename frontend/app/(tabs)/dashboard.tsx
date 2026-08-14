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
import {
  getPendingTrip,
} from "@/services/siri.service";

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
        <MonthlyIncomeGoalCard
          monthlyGoal={monthlyGoal}
        />
      )}

      <View style={styles.taxCard}>
        <View style={styles.taxHeader}>
          <View style={styles.taxIcon}>
            <Ionicons
              name="calculator-outline"
              size={18}
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
              size={15}
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
            size={20}
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
          size={19}
          color="#64748B"
        />
      </Pressable>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons
              name="speedometer-outline"
              size={17}
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
              size={17}
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
              size={18}
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
              size={18}
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
            size={19}
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
              size={18}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
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
    top: 12,
    left: 16,
    right: 16,
    zIndex: 1000,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    shadowColor: "#111827",
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
    fontSize: 14,
    fontWeight: "700",
  },

  welcomeContainer: {
    marginTop: 8,
    marginBottom: 20,
  },

  welcomeText: {
    fontSize: 28,
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
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    fontWeight: "500",
  },

  taxCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
    marginTop: 16,

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
    gap: 8,
  },

  taxIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  taxLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#64748B",
  },

  taxAmount: {
    marginTop: 12,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#111827",
  },

  taxHint: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  taxSavingsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  savingsIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  taxSavingsText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#22C55E",
  },

  offerAnalyzerButton: {
    minHeight: 68,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",

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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  offerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  offerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  offerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  metricRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },

  metricCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,

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
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  metricValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: "#111827",
  },

  metricLabel: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },

  actionsContainer: {
    marginTop: "auto",
    marginBottom: 18,
    paddingTop: 14,
  },

  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },

  actionButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 7,
  },

  actionButtonPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.98 }],
  },

  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  startTripButton: {
    marginTop: 12,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: "#4A6FE3",
    paddingHorizontal: 18,
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
    fontSize: 16,
    fontWeight: "700",
  },

  startTripButtonTextTracking: {
    color: "#475569",
  },
});