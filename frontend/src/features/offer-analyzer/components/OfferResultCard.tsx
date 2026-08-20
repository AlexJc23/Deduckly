import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  OfferResult,
  PremiumOfferResult,
} from "../types/offer.types";
import { useIsTablet } from "@/hooks/use-is-tablet";

type OfferResultCardProps = {
  result: OfferResult | PremiumOfferResult;
};

export function OfferResultCard({
  result,
}: OfferResultCardProps) {
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const isPremium = "score" in result;

  const recommendationColor = isPremium
    ? result.recommendation === "accept"
      ? "#22C55E"
      : result.recommendation === "consider"
      ? "#F59E0B"
      : "#EF4444"
    : result.color;

  const backgroundColor = isPremium
    ? result.recommendation === "accept"
      ? "#F0FDF4"
      : result.recommendation === "consider"
      ? "#FFFBEB"
      : "#FEF2F2"
    : result.color + "10";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor: recommendationColor,
        },
      ]}
    >
      {isPremium ? (
        <View style={styles.hero}>
          <View
            style={[
              styles.scoreContainer,
              {
                backgroundColor:
                  recommendationColor + "14",
              },
            ]}
          >
            <Text style={styles.score}>
              {result.score}
            </Text>
          </View>

          <Text
            style={[
              styles.recommendation,
              {
                color: recommendationColor,
              },
            ]}
          >
            {result.recommendation.toUpperCase()}
          </Text>

          <Text style={styles.subtitle}>
            {result.summary}
          </Text>
        </View>
      ) : (
        <View style={styles.hero}>
          <Text style={styles.dpm}>
            ${result.dollarsPerMile.toFixed(2)}
          </Text>

          <Text style={styles.subtitle}>
            per mile
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>
        Offer Breakdown
      </Text>

      {isPremium ? (
        <>
          <View style={styles.statRow}>
            <Text style={styles.label}>
              Estimated Profit
            </Text>

            <Text style={styles.value}>
              $
              {result.estimatedProfit.toFixed(
                2
              )}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.label}>
              Profit / Hour
            </Text>

            <Text style={styles.value}>
              $
              {result.profitHourlyRate.toFixed(
                2
              )}
              /hr
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.label}>
              Dollars / Mile
            </Text>

            <Text style={styles.value}>
              $
              {result.dollarsPerMile.toFixed(
                2
              )}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.label}>
              Vehicle Cost
            </Text>

            <Text style={styles.value}>
              $
              {result.vehicleCost.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.label}>
              Gross Hourly
            </Text>

            <Text style={styles.value}>
              $
              {result.hourlyRate.toFixed(2)}
              /hr
            </Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.statRow}>
            <Text style={styles.label}>
              Dollars / Mile
            </Text>

            <Text style={styles.value}>
              $
              {result.dollarsPerMile.toFixed(
                2
              )}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.label}>
              Hourly
            </Text>

            <Text style={styles.value}>
              $
              {result.hourlyRate.toFixed(2)}
              /hr
            </Text>
          </View>
        </>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>
        {isPremium
          ? "Your Preferences"
          : "Analysis"}
      </Text>

      {isPremium
        ? result.premiumChecks.map(
            (check, index) => (
              <View
                key={index}
                style={styles.reasonRow}
              >
                <View
                  style={[
                    styles.icon,
                    check.passed
                      ? styles.positiveIcon
                      : styles.negativeIcon,
                  ]}
                >
                  <Ionicons
                    name={
                      check.passed
                        ? "checkmark"
                        : "close"
                    }
                    size={isTablet ? 15 : 13}
                    color={
                      check.passed
                        ? "#16A34A"
                        : "#DC2626"
                    }
                  />
                </View>

                <View style={styles.reasonContent}>
                  <Text style={styles.reason}>
                    {check.title}
                  </Text>

                  <Text style={styles.checkDetails}>
                    Current:{" "}
                    {check.actual.toFixed(2)}
                    {"  •  "}
                    Goal:{" "}
                    {check.target.toFixed(2)}
                  </Text>
                </View>
              </View>
            )
          )
        : result.reasons.map(
            (reason, index) => {
              const passed =
                !reason
                  .toLowerCase()
                  .includes("low") &&
                !reason
                  .toLowerCase()
                  .includes("poor") &&
                !reason
                  .toLowerCase()
                  .includes("bad") &&
                !reason
                  .toLowerCase()
                  .includes("skip");

              return (
                <View
                  key={index}
                  style={styles.reasonRow}
                >
                  <View
                    style={[
                      styles.icon,
                      passed
                        ? styles.positiveIcon
                        : styles.negativeIcon,
                    ]}
                  >
                    <Ionicons
                      name={
                        passed
                          ? "checkmark"
                          : "close"
                      }
                      size={isTablet ? 15 : 13}
                      color={
                        passed
                          ? "#16A34A"
                          : "#DC2626"
                      }
                    />
                  </View>

                  <Text style={styles.reason}>
                    {reason}
                  </Text>
                </View>
              );
            }
          )}
    </View>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    card: {
      width: "100%",
      maxWidth: isTablet ? 900 : undefined,
      alignSelf: isTablet ? "center" : undefined,

      borderRadius: isTablet ? 24 : 18,
      padding: isTablet ? 28 : 18,
      marginBottom: isTablet ? 60 : 50,
      borderWidth: 1,

      shadowColor: "#111827",
      shadowOpacity: isTablet ? 0.07 : 0.05,
      shadowRadius: isTablet ? 16 : 10,
      shadowOffset: {
        width: 0,
        height: isTablet ? 5 : 3,
      },

      elevation: isTablet ? 3 : 2,
      gap: isTablet ? 20 : 16,
    },

    hero: {
      alignItems: "center",
      justifyContent: "center",
      gap: isTablet ? 8 : 5,
      paddingVertical: isTablet ? 18 : 8,
    },

    scoreContainer: {
      width: isTablet ? 118 : 82,
      height: isTablet ? 118 : 82,
      borderRadius: isTablet ? 59 : 41,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isTablet ? 8 : 4,
    },

    score: {
      fontSize: isTablet ? 56 : 42,
      fontWeight: "800",
      color: "#111827",
      lineHeight: isTablet ? 64 : 48,
      letterSpacing: -1,
    },

    recommendation: {
      fontSize: isTablet ? 20 : 16,
      fontWeight: "800",
      letterSpacing: 1,
    },

    dpm: {
      fontSize: isTablet ? 52 : 40,
      lineHeight: isTablet ? 60 : 46,
      fontWeight: "800",
      color: "#111827",
      letterSpacing: -1,
    },

    subtitle: {
      textAlign: "center",
      color: "#64748B",
      fontSize: isTablet ? 15 : 13,
      lineHeight: isTablet ? 22 : 19,
      maxWidth: isTablet ? 520 : 280,
    },

    divider: {
      height: 1,
      backgroundColor: "#E5E7EB",
    },

    sectionTitle: {
      fontSize: isTablet ? 17 : 14,
      fontWeight: "800",
      color: "#111827",
      marginBottom: isTablet ? 0 : -3,
    },

    statRow: {
      minHeight: isTablet ? 40 : 28,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: isTablet ? 3 : 0,
    },

    label: {
      fontSize: isTablet ? 15 : 13,
      color: "#64748B",
      fontWeight: "600",
    },

    value: {
      fontSize: isTablet ? 16 : 14,
      color: "#111827",
      fontWeight: "700",
    },

    reasonRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: isTablet ? 13 : 10,
    },

    icon: {
      width: isTablet ? 28 : 22,
      height: isTablet ? 28 : 22,
      borderRadius: isTablet ? 9 : 7,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 1,
    },

    positiveIcon: {
      backgroundColor: "#DCFCE7",
    },

    negativeIcon: {
      backgroundColor: "#FEE2E2",
    },

    reasonContent: {
      flex: 1,
    },

    reason: {
      flex: 1,
      fontSize: isTablet ? 15 : 13,
      lineHeight: isTablet ? 22 : 19,
      color: "#334155",
      fontWeight: "600",
    },

    checkDetails: {
      fontSize: isTablet ? 12 : 11,
      color: "#64748B",
      marginTop: isTablet ? 4 : 3,
      lineHeight: isTablet ? 18 : 16,
    },
  });