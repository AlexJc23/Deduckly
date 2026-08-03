import { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StartTripModal } from "@/features/tracking/components/StartTripModal";
import { useTracking } from "@/features/tracking/context/tracking.context";
import { MonthlyIncomeGoalCard } from "@/features/reports/components/MonthlyIncomeGoal";
import { useMonthlyGoal } from "@/features/users/hooks/use-monthly-goal";
import { useTodayReport } from "@/features/reports/hooks/use-today-report";
import { getCurrentMonthAndYear } from "@/features/reports/utils/date";
import { useCurrentReport } from "@/features/reports/hooks/use-current-report";

export default function DashboardScreen() {
  const userQuery = useCurrentUser();

  const [showStartTripModal, setShowStartTripModal] = useState(false);
  const { isTracking } = useTracking();
  const { saved } = useLocalSearchParams();

  const [showBanner, setShowBanner] = useState(false);
  const hideBannerTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: monthlyGoal } = useMonthlyGoal();

  const { year, month } = getCurrentMonthAndYear();

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
  const todayMiles = todayReport?.total_miles.toFixed(2) ?? "--";
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
  const subtitles = [
    "Making taxes slightly less terrible.",
    "Your accountant would be proud.",
    "The IRS hates this app.",
    "Adulting, unfortunately.",
    "Because guessing isn't bookkeeping.",
    "Finding money you already earned.",
    "Your accountant would be proud.",
    "The numbers don't judge.",
    "Money in. Stress out.",
    "Less paperwork. More driving.",
    "Turning 'I think...' into 'I know.'",
    "Every mile has a story.",
  ];

  const [subtitle] = useState(() => {
    return subtitles[
      Math.floor(Math.random() * subtitles.length)
    ];
  });

  useEffect(() => {
    if (saved === "true") {
      setShowBanner(true);

      if (hideBannerTimeout.current) {
        clearTimeout(hideBannerTimeout.current);
      }

      hideBannerTimeout.current = setTimeout(() => {
        setShowBanner(false);
        hideBannerTimeout.current = null;
      }, 3000);
    }

    return () => {
      if (hideBannerTimeout.current) {
        clearTimeout(hideBannerTimeout.current);
      }
    };
  }, [saved]);

  if (monthlyLoading || todayLoading) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 20,
        paddingTop: 0,
        backgroundColor: "#FFF",
      }}
    >
      {showBanner && (
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 16,
            right: 16,
            backgroundColor: "#34C759",
            padding: 12,
            borderRadius: 12,
            zIndex: 1000,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Trip Saved Successfully
          </Text>
        </View>
      )}

      {userQuery.data && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            <Text style={styles.welcomeLight}>
              Welcome back,
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
        <MonthlyIncomeGoalCard monthlyGoal={monthlyGoal} />
      )}

      <View
        style={{
          width: "90%",
          backgroundColor: "#fff",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          padding: 18,
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "700",
          }}
        >
          ${estimatedTaxOwed}
        </Text>

        <Text
          style={{
            color: "#6B7280",
            marginTop: 4,
            fontSize: 12,
          }}
        >
          Estimated taxes this month
          (not fun... we know)
        </Text>

        <View style={{ marginTop: 18 }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "700",
            }}
          >
            ${estimatedTaxSavings} cut so far
          </Text>
        </View>
      </View>

      <View>
        <Pressable
          style={({ pressed }) => ({
            marginTop: 20,
            backgroundColor: pressed ? "#279A41" : "#2EAF4A",
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
            transform: [{ scale: pressed ? 0.98 : 1 }],
            opacity: pressed ? 0.92 : 1,
          })}
          onPress={() => {router.push("/offer-analyzer/screens/OfferAnalyzerScreen")} }
        >
          <Text>Offer Analyzer</Text>
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
          gap: 12,
          width: "90%",
          alignSelf: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFF",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 16,
          }}
        >
          <Text>{todayMiles} miles today</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#FFF",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 16,
          }}
        >
          <Text>${todayExpenses} expenses</Text>
        </View>
      </View>

      <View
        style={{
          marginBottom: 30,
          marginTop: "auto",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            width: "90%",
            alignSelf: "center",
          }}
        >
            
            <Pressable
              style={{
                flex: 1,
                padding: 18,
                borderRadius: 12,
                borderWidth: 1,
              borderColor: "#E5E7EB",
              alignItems: "center",
            }}

            onPress={() => router.push("/income/create")}
          >
            <Text
              style={{
                fontWeight: "600",
              }}
            >
              Add Income
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/expense/create")}
            style={{
              flex: 1,
              padding: 18,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
              }}
            >
              Add Expense
            </Text>
          </Pressable>
        </View>

        <View>
          <Pressable
            onPress={!isTracking ? openStartModal : () => router.push("/tracking/active")}
            style={{
              marginTop: 20,
              marginBottom: "auto",
              width: "90%",
              alignSelf: "center",
              backgroundColor: isTracking ? "#D1D5DB" : "#22C55E",
              borderRadius: 30,
              paddingVertical: 18,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: isTracking ? "#ffffff" : "#000",
                fontSize: 18,
                fontWeight: "600",
                margin: 20,
              }}
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
});