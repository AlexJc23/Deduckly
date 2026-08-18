import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";

import Logo from "../../assets/images/logo.svg";
import { BackHeader } from "@/components/ui/BackButton";

import { PurchasesPackage } from "react-native-purchases";

import { revenueCatService } from "@/features/subscriptions/services/revenuecat.service";
import { useRestorePurchases } from "@/features/subscriptions/hooks/use-restore-purchases";

const FEATURES = [
  {
    icon: "bar-chart-outline" as const,
    title: "Advanced business reports",
  },
  {
    icon: "cash-outline" as const,
    title: "Profit & tax insights",
  },
  {
    icon: "flag-outline" as const,
    title: "Income goals & progress",
  },
  {
    icon: "rocket-outline" as const,
    title: "Priority updates",
  },
];

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] =
    useState<"annual" | "monthly">("annual");
  const [annualPackage, setAnnualPackage] =
    useState<PurchasesPackage | null>(null);

  const [monthlyPackage, setMonthlyPackage] =
    useState<PurchasesPackage | null>(null);

  const [loadingOfferings, setLoadingOfferings] =
    useState(true);

  const restorePurchases = useRestorePurchases();

  useEffect(() => {
    async function loadOfferings() {
      try {
        const offerings =
          await revenueCatService.getOfferings();

        const current = offerings.current;
        console.log(
          "RevenueCat current offering:",
          current,
        );

        if (!current) {
          console.warn(
            "RevenueCat: no current offering found",
          );
          return;
        }

        setAnnualPackage(
          current.annual ?? null,
        );

        setMonthlyPackage(
          current.monthly ?? null,
        );
      } catch (error) {
        console.error(
          "Failed to load RevenueCat offerings:",
          error,
        );
      } finally {
        setLoadingOfferings(false);
      }
    }

    loadOfferings();
  }, []);
  return (
    <View style={styles.container}>
      <BackHeader />

      <SafeAreaView
        style={styles.safeArea}
        edges={["bottom", "left", "right"]}
      >
        <View style={styles.content}>

          {/* Header */}

          <View style={styles.header}>
            <Logo
              width={52}
              height={52}
              color="#3F6EE8"
            />

            <View style={styles.proBadge}>
              <Ionicons
                name="sparkles"
                size={11}
                color="#3F6EE8"
              />

              <Text style={styles.proBadgeText}>
                DEDUCKLY PRO
              </Text>
            </View>

            <Text style={styles.title}>
              Work smarter.
            </Text>

            <Text style={styles.subtitle}>
              Get deeper insights for offers,
              track your progress, and stay tax-ready
              all year long.
            </Text>
          </View>

          {/* Features */}

          <View style={styles.featuresCard}>
            {FEATURES.map((feature, index) => (
              <View
                key={feature.title}
                style={[
                  styles.featureRow,
                  index === FEATURES.length - 1 &&
                    styles.lastFeatureRow,
                ]}
              >
                <View style={styles.featureIcon}>
                  <Ionicons
                    name={feature.icon}
                    size={17}
                    color="#3F6EE8"
                  />
                </View>

                <Text style={styles.featureText}>
                  {feature.title}
                </Text>

                <View style={styles.check}>
                  <Ionicons
                    name="checkmark"
                    size={13}
                    color="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Plans */}

          <View style={styles.planHeader}>
            <Text style={styles.chooseLabel}>
              CHOOSE YOUR PLAN
            </Text>

            <Text style={styles.planHint}>
              Cancel anytime
            </Text>
          </View>

          <View style={styles.plans}>

            {/* Annual */}

            <Pressable
              style={[
                styles.plan,
                selectedPlan === "annual" &&
                  styles.selectedPlan,
              ]}
              onPress={() =>
                setSelectedPlan("annual")
              }
            >
              <View
                style={[
                  styles.radio,
                  selectedPlan === "annual" &&
                    styles.radioSelected,
                ]}
              >
                {selectedPlan === "annual" && (
                  <View style={styles.radioDot} />
                )}
              </View>

              <View style={styles.planInfo}>
                <View style={styles.planNameRow}>
                  <Text style={styles.planName}>
                    Annual
                  </Text>

                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>
                      2 MONTHS FREE
                    </Text>
                  </View>
                </View>

                <Text style={styles.planDescription}>
                  Best value for year-round tracking
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {annualPackage?.product.priceString ?? "$49.99"}
                </Text>

                <Text style={styles.period}>
                  /year
                </Text>
              </View>
            </Pressable>

            {/* Monthly */}

            <Pressable
              style={[
                styles.plan,
                selectedPlan === "monthly" &&
                  styles.selectedPlan,
              ]}
              onPress={() =>
                setSelectedPlan("monthly")
              }
            >
              <View
                style={[
                  styles.radio,
                  selectedPlan === "monthly" &&
                    styles.radioSelected,
                ]}
              >
                {selectedPlan === "monthly" && (
                  <View style={styles.radioDot} />
                )}
              </View>

              <View style={styles.planInfo}>
                <Text style={styles.planName}>
                  Monthly
                </Text>

                <Text style={styles.planDescription}>
                  Flexible month-to-month billing
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {monthlyPackage?.product.priceString ?? "$4.99"}
                </Text>

                <Text style={styles.period}>
                  /month
                </Text>
              </View>
            </Pressable>

          </View>

          {/* CTA */}

          <Pressable
            style={styles.subscribeButton}
            onPress={async () => {
              const pkg =
                selectedPlan === "annual"
                  ? annualPackage
                  : monthlyPackage;

              if (!pkg) {
                console.warn(
                  "RevenueCat package is not available",
                );
                return;
              }

              try {
                const customerInfo =
                  await revenueCatService.purchasePackage(pkg);

                console.log(
                  "RevenueCat customer info:",
                  customerInfo,
                );
              } catch (error: any) {
                console.error(
                  "RevenueCat purchase failed:",
                  error,
                );

                console.error(
                  "RevenueCat purchase error code:",
                  error?.code,
                );

                console.error(
                  "RevenueCat purchase error message:",
                  error?.message,
                );

                console.error(
                  "RevenueCat purchase error userCancelled:",
                  error?.userCancelled,
                );
              }
            }}
          >
            <Text style={styles.subscribeText}>
              Continue with{" "}
              {selectedPlan === "annual"
                ? "Annual"
                : "Monthly"}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={19}
              color="#FFFFFF"
            />
          </Pressable>

          <Text style={styles.cancelText}>
            Cancel anytime
          </Text>

          <Pressable
            style={styles.restoreButton}
            onPress={async () => {
              try {
                await restorePurchases.mutateAsync();
              } catch (error) {
                console.error(
                  "RevenueCat restore failed:",
                  error,
                );
              }
            }}
          >
            <Text style={styles.restoreText}>
              Restore Purchases
            </Text>
          </Pressable>

          <Text style={styles.legal}>
            Payment is charged to your Apple Account.
            Subscriptions renew automatically unless
            canceled at least 24 hours before the current
            period ends.
          </Text>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  /* Header */

  header: {
    alignItems: "center",
    paddingTop: 20,
  },

  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 9,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EAF0FF",
  },

  proBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#3F6EE8",
  },

  title: {
    marginTop: 10,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: "#273449",
  },

  subtitle: {
    maxWidth: 335,
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  /* Features */

  featuresCard: {
    marginTop: 22,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  featureRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },

  lastFeatureRow: {
    borderBottomWidth: 0,
  },

  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
    marginRight: 12,
  },

  featureText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  check: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3F6EE8",
  },

  /* Plans */

  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 9,
  },

  chooseLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "#94A3B8",
  },

  planHint: {
    fontSize: 10,
    color: "#94A3B8",
  },

  plans: {
    gap: 9,
  },

  plan: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E7F0",
    backgroundColor: "#FFFFFF",
  },

  selectedPlan: {
    borderColor: "#3F6EE8",
    backgroundColor: "#F4F7FF",
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  radioSelected: {
    borderColor: "#3F6EE8",
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: "#3F6EE8",
  },

  planInfo: {
    flex: 1,
    paddingRight: 8,
  },

  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  planName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#273449",
  },

  planDescription: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  savingsBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#EAF0FF",
  },

  savingsText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.4,
    color: "#3F6EE8",
  },

  priceContainer: {
    alignItems: "flex-end",
  },

  price: {
    fontSize: 21,
    fontWeight: "800",
    color: "#273449",
  },

  period: {
    marginTop: 0,
    fontSize: 9,
    color: "#64748B",
  },

  /* CTA */

  subscribeButton: {
    height: 55,
    marginTop: 15,
    borderRadius: 16,
    backgroundColor: "#3F6EE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,

    shadowColor: "#3F6EE8",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  subscribeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  cancelText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 10,
    color: "#94A3B8",
  },

  restoreButton: {
    alignSelf: "center",
    paddingVertical: 7,
    marginTop: 4,
  },

  restoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },

  legal: {
    marginTop: 3,
    paddingHorizontal: 15,
    textAlign: "center",
    color: "#A0AEC0",
    fontSize: 8,
    lineHeight: 12,

  },
});