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


import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { MonthlyIncomeGoalCard } from "@/features/reports/components/MonthlyIncomeGoal";
import { useCurrentReport } from "@/features/reports/hooks/use-current-report";
import { useTodayReport } from "@/features/reports/hooks/use-today-report";
import { getCurrentMonthAndYear } from "@/features/reports/utils/date";
import { StartTripModal } from "@/features/tracking/components/StartTripModal";
import { useTracking } from "@/features/tracking/context/tracking.context";
import { useMonthlyGoal } from "@/features/users/hooks/use-monthly-goal";
import { getPendingTrip, getPendingStop } from "@/services/siri.service";

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
  const { isTracking, startTrackingFromSiri, stopTracking } = useTracking();

  const [showStartTripModal, setShowStartTripModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: monthlyGoal } = useMonthlyGoal();
  const { year, month } = getCurrentMonthAndYear();

  const { data: todayReport, isLoading: todayLoading } = useTodayReport();
  const { data: monthlyReport, isLoading: monthlyLoading } = useCurrentReport({
    year,
    month,
  });

  const estimatedTaxOwed = monthlyReport?.estimated_tax_owed.toFixed(2) ?? "--";
  const estimatedTaxSavings =
    monthlyReport?.estimated_tax_savings.toFixed(2) ?? "--";
  const todayMiles = todayReport?.total_miles.toFixed(2) ?? "--";
  const todayExpenses = todayReport?.total_expenses.toFixed(2) ?? "--";

  const openStartModal = useCallback(() => setShowStartTripModal(true), []);
  const closeStartModal = useCallback(() => setShowStartTripModal(false), []);

  const [subtitle] = useState(
    () => subtitles[Math.floor(Math.random() * subtitles.length)],
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
    const shouldStop = await getPendingStop();

    if (shouldStop) {
      clearInterval(interval);

      const result = await stopTracking(null);

      if (result === true) {
        router.replace("/(tabs)/dashboard");
      }

      return;
    }

    const pendingTrip = await getPendingTrip();

    if (!pendingTrip) return;

    clearInterval(interval);

    await startTrackingFromSiri(pendingTrip.platform);

    router.replace("/tracking/active");
  }, 500);

  return () => clearInterval(interval);
}, []);

  if (monthlyLoading || todayLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {showBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Trip Saved Successfully</Text>
        </View>
      )}

      {userQuery.data && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            <Text style={styles.welcomeLight}>{greeting}</Text>{" "}
            <Text style={styles.welcomeName}>{userQuery.data.first_name}!</Text>
          </Text>

          <Text style={styles.welcomeSubtitle}>{subtitle}</Text>
        </View>
      )}

      {monthlyGoal && <MonthlyIncomeGoalCard monthlyGoal={monthlyGoal} />}

      <View style={styles.taxCard}>
        <Text style={styles.taxAmount}>${estimatedTaxOwed}</Text>

        <Text style={styles.taxHint}>
          Estimated taxes this month (not fun... we know)
        </Text>

        <View style={styles.taxSavingsRow}>
          <Text style={styles.taxSavingsText}>
            ${estimatedTaxSavings} cut so far
          </Text>
        </View>
      </View>

      <View>
        <Pressable
          style={({ pressed }) => [
            styles.offerAnalyzerButton,
            pressed && styles.offerAnalyzerButtonPressed,
          ]}
          onPress={() => router.push("/offer-analyzer/screens/OfferAnalyzerScreen")}
        >
          <Text>Offer Analyzer</Text>
        </Pressable>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text>{todayMiles} miles today</Text>
        </View>

        <View style={styles.metricCard}>
          <Text>${todayExpenses} expenses</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.actionButtonsRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/income/create")}
          >
            <Text style={styles.actionButtonText}>Add Income</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/expense/create")}
          >
            <Text style={styles.actionButtonText}>Add Expense</Text>
          </Pressable>
        </View>

        <View>
          <Pressable
            onPress={
              !isTracking
                ? openStartModal
                : () => router.push("/tracking/active")
            }
            style={[
              styles.startTripButton,
              isTracking && styles.startTripButtonTracking,
            ]}
          >
            <Text
              style={[
                styles.startTripButtonText,
                isTracking && styles.startTripButtonTextTracking,
              ]}
            >
              {isTracking ? "Trip in Progress" : "Start Trip"}
            </Text>
          </Pressable>
        </View>
      </View>

      <StartTripModal visible={showStartTripModal} onClose={closeStartModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    backgroundColor: "#FFF",
  },
  banner: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "#34C759",
    padding: 12,
    borderRadius: 12,
    zIndex: 1000,
  },
  bannerText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  welcomeContainer: {
    marginTop: 10,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    letterSpacing: -0.8,
  },
  welcomeLight: {
    color: "#6B7280",
    fontWeight: "500",
  },
  welcomeName: {
    color: "#111827",
    fontWeight: "900",
  },
  welcomeSubtitle: {
    marginTop: 4,
    fontSize: 15,
    color: "#8B95A7",
    fontWeight: "500",
  },
  taxCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
    alignSelf: "center",
  },
  taxAmount: {
    fontSize: 30,
    fontWeight: "700",
  },
  taxHint: {
    color: "#6B7280",
    marginTop: 4,
    fontSize: 12,
  },
  taxSavingsRow: {
    marginTop: 18,
  },
  taxSavingsText: {
    fontSize: 26,
    fontWeight: "700",
  },
  offerAnalyzerButton: {
    marginTop: 20,
    backgroundColor: "#2EAF4A",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#47C862",
    shadowColor: "#2EAF4A",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
  offerAnalyzerButtonPressed: {
    backgroundColor: "#279A41",
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  metricRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
    width: "90%",
    alignSelf: "center",
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  actionsContainer: {
    marginBottom: 30,
    marginTop: "auto",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "90%",
    alignSelf: "center",
  },
  actionButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  actionButtonText: {
    fontWeight: "600",
  },
  startTripButton: {
    marginTop: 20,
    marginBottom: "auto",
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#22C55E",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
  },
  startTripButtonTracking: {
    backgroundColor: "#D1D5DB",
  },
  startTripButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
    margin: 20,
  },
  startTripButtonTextTracking: {
    color: "#ffffff",
  },
});