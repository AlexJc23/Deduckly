import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import React from "react";

import { BackHeader } from "@/components/ui/BackButton";
import { useMileageRates } from "@/features/settings/hooks/use-mileage-rate";

export default function MileageRate() {
  const {
    data: mileageRates,
    isLoading,
  } = useMileageRates();

  const currentRate = mileageRates?.[0];

  const IRS_MILEAGE_URL =
    "https://www.irs.gov/irb/2026-29_irb";

  function formatEffectiveDate(
    date?: string,
  ): string {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      },
    );
  }

  return (
    <View style={styles.screen}>
      <BackHeader />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Rate */}

          <View style={styles.currentCard}>
            <View style={styles.currentHeader}>
              <View>
                <Text style={styles.eyebrow}>
                  IRS STANDARD RATE
                </Text>

                <Text style={styles.currentTitle}>
                  Business Mileage
                </Text>
              </View>

              <View style={styles.rateIcon}>
                <Text style={styles.rateIconText}>
                  $
                </Text>
              </View>
            </View>

            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#4A6FE3"
                style={styles.loader}
              />
            ) : (
              <Text style={styles.currentRate}>
                {currentRate
                  ? (
                      currentRate.business_rate *
                      100
                    ).toFixed(1)
                  : "—"}
                <Text style={styles.rateUnit}>
                  ¢ / mile
                </Text>
              </Text>
            )}

            <View style={styles.divider} />

            <View style={styles.currentFooter}>
              <View>
                <Text style={styles.footerLabel}>
                  Effective
                </Text>

                <Text style={styles.date}>
                  {formatEffectiveDate(
                    currentRate?.effective_date,
                  )}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />

                <Text style={styles.statusText}>
                  Current
                </Text>
              </View>
            </View>
          </View>

          {/* About */}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>
                About the Mileage Rate
              </Text>
            </View>

            <Text style={styles.body}>
              The IRS standard mileage rate is
              used to calculate your deduction
              for business driving. It includes
              costs such as gas, maintenance,
              depreciation, insurance, and
              repairs.
            </Text>

            <Text style={styles.body}>
              If you use the Standard Mileage
              method, these vehicle expenses
              generally cannot be deducted
              separately.
            </Text>

            <Pressable
              style={styles.linkButton}
              onPress={() =>
                Linking.openURL(
                  IRS_MILEAGE_URL,
                )
              }
            >
              <Text style={styles.link}>
                View IRS Mileage Rates
              </Text>

              <Text style={styles.linkArrow}>
                ↗
              </Text>
            </Pressable>
          </View>

          {/* Previous Rates */}

          <View style={styles.card}>
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Previous Rates
                </Text>

                <Text style={styles.historySubtitle}>
                  Historical IRS business rates
                </Text>
              </View>
            </View>

            {isLoading ? (
              <View style={styles.historyLoader}>
                <ActivityIndicator
                  color="#4A6FE3"
                />
              </View>
            ) : mileageRates?.length ? (
              <View style={styles.rateList}>
                {mileageRates.map(
                  (rate: {
                    id: string;
                    effective_date: string;
                    business_rate: number;
                  }) => (
                    <View
                      key={rate.id}
                      style={styles.rateRow}
                    >
                      <View>
                        <Text
                          style={styles.rateDate}
                        >
                          {formatEffectiveDate(
                            rate.effective_date,
                          )}
                        </Text>

                        {rate.id ===
                          currentRate?.id && (
                          <Text
                            style={
                              styles.currentLabel
                            }
                          >
                            Current rate
                          </Text>
                        )}
                      </View>

                      <Text
                        style={styles.rateAmount}
                      >
                        {(
                          rate.business_rate *
                          100
                        ).toFixed(1)}
                        <Text
                          style={
                            styles.rateAmountUnit
                          }
                        >
                          ¢ / mile
                        </Text>
                      </Text>
                    </View>
                  ),
                )}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                No mileage rates available.
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },

  currentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },

  currentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#94A3B8",
    marginBottom: 4,
  },

  currentTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#273449",
  },

  rateIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#DDE5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  rateIconText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#4A6FE3",
  },

  currentRate: {
    marginTop: 22,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "800",
    letterSpacing: -1,
    color: "#273449",
  },

  rateUnit: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    color: "#64748B",
  },

  loader: {
    marginVertical: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginTop: 20,
    marginBottom: 14,
  },

  currentFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  footerLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 2,
  },

  date: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A6FE3",
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3B5FCC",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },

  cardHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#273449",
  },

  body: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    marginBottom: 14,
  },

  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 2,
    paddingVertical: 5,
  },

  link: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A6FE3",
  },

  linkArrow: {
    marginLeft: 5,
    fontSize: 15,
    fontWeight: "700",
    color: "#4A6FE3",
  },

  historyHeader: {
    marginBottom: 4,
  },

  historySubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#94A3B8",
  },

  rateList: {
    marginTop: 8,
  },

  rateRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },

  rateDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  currentLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: "#4A6FE3",
  },

  rateAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#273449",
  },

  rateAmountUnit: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },

  historyLoader: {
    paddingVertical: 24,
  },

  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: "#94A3B8",
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