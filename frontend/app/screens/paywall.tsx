import {
  Animated,
  Dimensions,
  Easing,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";

import Logo from "../../assets/images/logo.svg";
import { BackHeader } from "@/components/ui/BackButton";

import { PurchasesPackage } from "react-native-purchases";

import { revenueCatService } from "@/features/subscriptions/services/revenuecat.service";
import { useRestorePurchases } from "@/features/subscriptions/hooks/use-restore-purchases";
import { useIsTablet } from "@/hooks/use-is-tablet";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

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

type ConfettiPiece = {
  id: number;
  x: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
};

const CONFETTI_COLORS = [
  "#3F6EE8",
  "#16A34A",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
];

function Confetti({
  visible,
  styles,
}: {
  visible: boolean;
  styles: ReturnType<typeof getStyles>;
}) {
  const pieces = useRef<ConfettiPiece[]>(
    Array.from({ length: 55 }, (_, index) => ({
      id: index,
      x: Math.random() * SCREEN_WIDTH,
      color:
        CONFETTI_COLORS[
          index % CONFETTI_COLORS.length
        ],
      size: 5 + Math.random() * 5,
      rotation: Math.random() * 360,
      delay: Math.random() * 350,
    })),
  ).current;

  const animations = useRef(
    pieces.map(() => ({
      translateY: new Animated.Value(-30),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    if (!visible) {
      animations.forEach((animation) => {
        animation.translateY.setValue(-30);
        animation.translateX.setValue(0);
        animation.rotate.setValue(0);
        animation.opacity.setValue(0);
      });

      return;
    }

    animations.forEach((animation, index) => {
      const piece = pieces[index];

      Animated.sequence([
        Animated.delay(piece.delay),

        Animated.parallel([
          Animated.timing(animation.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),

          Animated.timing(animation.translateY, {
            toValue: SCREEN_HEIGHT + 100,
            duration: 2200 + Math.random() * 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),

          Animated.timing(animation.translateX, {
            toValue: (Math.random() - 0.5) * 180,
            duration: 2200 + Math.random() * 700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),

          Animated.timing(animation.rotate, {
            toValue: 4 + Math.random() * 6,
            duration: 2400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),

        Animated.timing(animation.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={styles.confettiContainer}
    >
      {pieces.map((piece, index) => {
        const animation = animations[index];

        return (
          <Animated.View
            key={piece.id}
            style={[
              styles.confettiPiece,
              {
                left: piece.x,
                width: piece.size,
                height: piece.size * 1.6,
                backgroundColor: piece.color,
                transform: [
                  {
                    translateY: animation.translateY,
                  },
                  {
                    translateX: animation.translateX,
                  },
                  {
                    rotate: animation.rotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        `${piece.rotation}deg`,
                        `${piece.rotation + 360}deg`,
                      ],
                    }),
                  },
                ],
                opacity: animation.opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function PaywallScreen() {
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const [selectedPlan, setSelectedPlan] =
    useState<"annual" | "monthly">("annual");

  const [annualPackage, setAnnualPackage] =
    useState<PurchasesPackage | null>(null);

  const [monthlyPackage, setMonthlyPackage] =
    useState<PurchasesPackage | null>(null);

  const [loadingOfferings, setLoadingOfferings] =
    useState(true);

  const [isPurchasing, setIsPurchasing] =
    useState(false);

  const [showConfetti, setShowConfetti] =
    useState(false);

  const restorePurchases = useRestorePurchases();

  useEffect(() => {
    async function loadOfferings() {
      try {
        const offerings =
          await revenueCatService.getOfferings();

        console.log(
          "RevenueCat offerings:",
          offerings,
        );

        const offering = offerings.current;

        if (!offering) {
          console.warn(
            "RevenueCat: no current offering found",
          );
          return;
        }

        setAnnualPackage(
          offering.annual ?? null,
        );

        setMonthlyPackage(
          offering.monthly ?? null,
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

  async function handlePurchase() {
    if (isPurchasing) {
      return;
    }

    const pkg =
      selectedPlan === "annual"
        ? annualPackage
        : monthlyPackage;

    if (!pkg) {
      return;
    }

    setIsPurchasing(true);

    try {
      const customerInfo =
        await revenueCatService.purchasePackage(pkg);

      const isPremium =
        customerInfo.entitlements.active["Deduckly Pro"] !== undefined;

      if (!isPremium) {
        return;
      }

      setShowConfetti(true);

      setTimeout(() => {
        router.replace("/(tabs)/dashboard");
      }, 1800);
    } catch (error: any) {
      if (error?.userCancelled) {
        return;
      }

      console.error("Purchase failed:", error);
    } finally {
      setIsPurchasing(false);
    }
  }
  return (
    <View style={styles.container}>
      <BackHeader />

      <SafeAreaView
        style={styles.safeArea}
        edges={["bottom", "left", "right"]}
      >
        <View style={styles.content}>
          <View style={styles.contentInner}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Logo
                  width={isTablet ? 68 : 52}
                  height={isTablet ? 68 : 52}
                  color="#3F6EE8"
                />
              </View>

              <View style={styles.proBadge}>
                <Ionicons
                  name="sparkles"
                  size={isTablet ? 14 : 11}
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
                track your progress, and stay
                tax-ready all year long.
              </Text>
            </View>

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
                      size={isTablet ? 21 : 17}
                      color="#3F6EE8"
                    />
                  </View>

                  <Text style={styles.featureText}>
                    {feature.title}
                  </Text>

                  <View style={styles.check}>
                    <Ionicons
                      name="checkmark"
                      size={isTablet ? 15 : 13}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.planHeader}>
              <Text style={styles.chooseLabel}>
                CHOOSE YOUR PLAN
              </Text>

              <Text style={styles.planHint}>
                Cancel anytime
              </Text>
            </View>

            <View style={styles.plans}>
              <Pressable
                disabled={isPurchasing}
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
                  <Text style={styles.planName}>
                    Annual
                  </Text>

                  <Text
                    style={styles.planDescription}
                  >
                    Best value for year-round
                    tracking
                  </Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    {annualPackage?.product.priceString ??
                      "$49.99"}
                  </Text>

                  <Text style={styles.period}>
                    /year
                  </Text>
                </View>
              </Pressable>

              <Pressable
                disabled={isPurchasing}
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

                  <Text
                    style={styles.planDescription}
                  >
                    Flexible month-to-month
                    billing
                  </Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    {monthlyPackage?.product.priceString ??
                      "$4.99"}
                  </Text>

                  <Text style={styles.period}>
                    /month
                  </Text>
                </View>
              </Pressable>
            </View>

            <Pressable
              disabled={
                isPurchasing ||
                loadingOfferings ||
                !(
                  selectedPlan === "annual"
                    ? annualPackage
                    : monthlyPackage
                )
              }
              style={[
                styles.subscribeButton,
                (isPurchasing ||
                  loadingOfferings ||
                  !(
                    selectedPlan === "annual"
                      ? annualPackage
                      : monthlyPackage
                  )) &&
                  styles.subscribeButtonDisabled,
              ]}
              onPress={handlePurchase}
            >
              <Text style={styles.subscribeText}>
                {loadingOfferings
                  ? "Loading..."
                  : isPurchasing
                    ? "Processing..."
                    : `Continue with ${
                        selectedPlan === "annual"
                          ? "Annual"
                          : "Monthly"
                      }`}
              </Text>

              {!isPurchasing && !loadingOfferings && (
                <Ionicons
                  name="arrow-forward"
                  size={isTablet ? 22 : 19}
                  color="#FFFFFF"
                />
              )}
            </Pressable>

            <Text style={styles.cancelText}>
              Cancel anytime
            </Text>

            <Pressable
              disabled={restorePurchases.isPending}
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
                {restorePurchases.isPending
                  ? "Restoring..."
                  : "Restore Purchases"}
              </Text>
            </Pressable>

            <Text style={styles.legal}>
              Payment is charged to your Apple
              Account. Subscriptions renew
              automatically unless canceled at
              least 24 hours before the current
              period ends.
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <Confetti
        visible={showConfetti}
        styles={styles}
      />

      {showConfetti && (
        <View
          pointerEvents="none"
          style={styles.successOverlay}
        >
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark"
                size={32}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.successTitle}>
              Welcome to Deduckly Pro!
            </Text>

            <Text style={styles.successSubtitle}>
              Your subscription is active.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    confettiContainer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 100,
      overflow: "hidden",
    },

    confettiPiece: {
      position: "absolute",
      top: 0,
      borderRadius: 2,
    },

    successOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 90,
      alignItems: "center",
      justifyContent: "center",
    },

    successCard: {
      alignItems: "center",
      paddingHorizontal: 30,
      paddingVertical: 25,
      borderRadius: 24,
      backgroundColor: "#FFFFFF",

      shadowColor: "#111827",
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffset: {
        width: 0,
        height: 10,
      },

      elevation: 8,
    },

    successIcon: {
      width: 58,
      height: 58,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#16A34A",
      marginBottom: 13,
    },

    successTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#273449",
      textAlign: "center",
    },

    successSubtitle: {
      marginTop: 5,
      fontSize: 13,
      color: "#64748B",
      textAlign: "center",
    },

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
      paddingHorizontal: isTablet ? 34 : 20,
      paddingBottom: isTablet ? 30 : 18,
    },

    contentInner: {
      flex: 1,
      width: "100%",
      maxWidth: isTablet ? 720 : undefined,
      alignSelf: isTablet ? "center" : undefined,
      justifyContent: "flex-start",
    },

    /* Header */

    header: {
      alignItems: "center",
      paddingTop: isTablet ? 20 : 20,
    },

    logoContainer: {
      alignItems: "center",
      justifyContent: "center",
    },

    proBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 6 : 5,
      marginTop: isTablet ? 12 : 9,
      paddingHorizontal: isTablet ? 12 : 9,
      paddingVertical: isTablet ? 5 : 4,
      borderRadius: 999,
      backgroundColor: "#EAF0FF",
    },

    proBadgeText: {
      fontSize: isTablet ? 9 : 8,
      fontWeight: "900",
      letterSpacing: 1,
      color: "#3F6EE8",
    },

    title: {
      marginTop: isTablet ? 14 : 10,
      fontSize: isTablet ? 38 : 28,
      lineHeight: isTablet ? 44 : 34,
      fontWeight: "800",
      letterSpacing: -1,
      color: "#273449",
    },

    subtitle: {
      maxWidth: isTablet ? 570 : 335,
      marginTop: isTablet ? 10 : 8,
      textAlign: "center",
      fontSize: isTablet ? 15 : 13,
      lineHeight: isTablet ? 22 : 19,
      color: "#64748B",
    },

    /* Features */

    featuresCard: {
      marginTop: isTablet ? 26 : 22,
      paddingHorizontal: isTablet ? 20 : 15,
      paddingVertical: isTablet ? 6 : 4,
      borderRadius: isTablet ? 22 : 18,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",

      shadowColor: "#111827",
      shadowOpacity: isTablet ? 0.04 : 0,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: isTablet ? 2 : 0,
    },

    featureRow: {
      minHeight: isTablet ? 62 : 48,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#EEF1F5",
    },

    lastFeatureRow: {
      borderBottomWidth: 0,
    },

    featureIcon: {
      width: isTablet ? 42 : 34,
      height: isTablet ? 42 : 34,
      borderRadius: isTablet ? 13 : 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EEF3FF",
      marginRight: isTablet ? 14 : 12,
    },

    featureText: {
      flex: 1,
      fontSize: isTablet ? 15 : 13,
      fontWeight: "700",
      color: "#334155",
    },

    check: {
      width: isTablet ? 26 : 22,
      height: isTablet ? 26 : 22,
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
      marginTop: isTablet ? 24 : 20,
      marginBottom: isTablet ? 11 : 9,
    },

    chooseLabel: {
      fontSize: isTablet ? 10 : 9,
      fontWeight: "900",
      letterSpacing: 1.2,
      color: "#94A3B8",
    },

    planHint: {
      fontSize: isTablet ? 11 : 10,
      color: "#94A3B8",
    },

    plans: {
      gap: isTablet ? 11 : 9,
    },

    plan: {
      minHeight: isTablet ? 88 : 72,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isTablet ? 20 : 15,
      paddingVertical: isTablet ? 14 : 11,
      borderRadius: isTablet ? 19 : 16,
      borderWidth: 1,
      borderColor: "#E1E7F0",
      backgroundColor: "#FFFFFF",
    },

    selectedPlan: {
      borderColor: "#3F6EE8",
      backgroundColor: "#F4F7FF",

      shadowColor: "#3F6EE8",
      shadowOpacity: isTablet ? 0.08 : 0,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: isTablet ? 1 : 0,
    },

    radio: {
      width: isTablet ? 25 : 21,
      height: isTablet ? 25 : 21,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: "#CBD5E1",
      alignItems: "center",
      justifyContent: "center",
      marginRight: isTablet ? 14 : 11,
    },

    radioSelected: {
      borderColor: "#3F6EE8",
    },

    radioDot: {
      width: isTablet ? 13 : 11,
      height: isTablet ? 13 : 11,
      borderRadius: 999,
      backgroundColor: "#3F6EE8",
    },

    planInfo: {
      flex: 1,
      paddingRight: isTablet ? 12 : 8,
    },

    planNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 8 : 7,
    },

    planName: {
      fontSize: isTablet ? 17 : 15,
      fontWeight: "800",
      color: "#273449",
    },

    planDescription: {
      marginTop: isTablet ? 5 : 4,
      fontSize: isTablet ? 12 : 11,
      color: "#64748B",
    },

    savingsBadge: {
      paddingHorizontal: isTablet ? 8 : 7,
      paddingVertical: isTablet ? 4 : 3,
      borderRadius: 6,
      backgroundColor: "#EAF0FF",
    },

    savingsText: {
      fontSize: isTablet ? 8 : 7,
      fontWeight: "900",
      letterSpacing: 0.4,
      color: "#3F6EE8",
    },

    priceContainer: {
      alignItems: "flex-end",
    },

    price: {
      fontSize: isTablet ? 25 : 21,
      fontWeight: "800",
      color: "#273449",
    },

    period: {
      marginTop: 0,
      fontSize: isTablet ? 10 : 9,
      color: "#64748B",
    },

    /* CTA */

    subscribeButton: {
      height: isTablet ? 64 : 55,
      marginTop: isTablet ? 17 : 15,
      borderRadius: isTablet ? 18 : 16,
      backgroundColor: "#3F6EE8",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: isTablet ? 10 : 9,

      shadowColor: "#3F6EE8",
      shadowOpacity: 0.2,
      shadowRadius: isTablet ? 14 : 10,
      shadowOffset: {
        width: 0,
        height: isTablet ? 7 : 5,
      },

      elevation: 3,
    },

    subscribeButtonDisabled: {
      opacity: 0.55,
    },

    subscribeText: {
      color: "#FFFFFF",
      fontSize: isTablet ? 18 : 16,
      fontWeight: "800",
    },

    cancelText: {
      marginTop: isTablet ? 9 : 8,
      textAlign: "center",
      fontSize: isTablet ? 11 : 10,
      color: "#94A3B8",
    },

    restoreButton: {
      alignSelf: "center",
      paddingVertical: isTablet ? 8 : 7,
      marginTop: isTablet ? 5 : 4,
    },

    restoreText: {
      fontSize: isTablet ? 13 : 12,
      fontWeight: "700",
      color: "#64748B",
    },

    legal: {
      marginTop: 3,
      paddingHorizontal: isTablet ? 30 : 15,
      textAlign: "center",
      color: "#A0AEC0",
      fontSize: isTablet ? 9 : 8,
      lineHeight: isTablet ? 13 : 12,
    },
  });