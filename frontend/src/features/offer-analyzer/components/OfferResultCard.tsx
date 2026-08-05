import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import {
  OfferResult,
  PremiumOfferResult,
} from "../types/offer.types";

type OfferResultCardProps = {
  result: OfferResult | PremiumOfferResult;
};

export function OfferResultCard({
  result,
}: OfferResultCardProps) {
  const isPremium = "score" in result;





  const recommendationColor = isPremium
    ? result.recommendation === "accept"
      ? "#16A34A"
      : result.recommendation === "consider"
      ? "#D97706"
      : "#DC2626"
    : result.color;

  const backgroundColor = isPremium
    ? result.recommendation === "accept"
      ? "#ECFDF5"
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
      {/* Hero */}

      {isPremium ? (
        <View style={styles.hero}>
          <Text style={styles.score}>
            {result.score}
          </Text>

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

      {/* Breakdown */}

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
                  <Text
                    style={[
                      styles.iconText,
                      check.passed
                        ? styles.positiveIconText
                        : styles.negativeIconText,
                    ]}
                  >
                    {check.passed
                      ? "✓"
                      : "✕"}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.reason}>
                    {check.title}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      marginTop: 2,
                    }}
                  >
                    Current:{" "}
                    {check.actual.toFixed(2)}
                    {" • "}
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
                    <Text
                      style={[
                        styles.iconText,
                        passed
                          ? styles.positiveIconText
                          : styles.negativeIconText,
                      ]}
                    >
                      {passed
                        ? "✓"
                        : "✕"}
                    </Text>
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
const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 50,
    borderWidth: 1.5,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,

    gap: 16,
  },

  hero: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },

  score: {
    fontSize: 56,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 60,
  },

  recommendation: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },

  dpm: {
    fontSize: 44,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 250,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(17,24,39,.08)",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: -4,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },

  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "800",
  },

  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
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

  iconText: {
    fontSize: 12,
    fontWeight: "900",
  },

  positiveIconText: {
    color: "#16A34A",
  },

  negativeIconText: {
    color: "#DC2626",
  },

  reason: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
    fontWeight: "500",
  },
});

