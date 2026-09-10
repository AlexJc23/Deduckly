import { localizedAlert } from "@/i18n/alerts";
import { useLanguage, Translated } from "@/i18n/language";
import {
  Pressable,
  Text,
  View,
  SafeAreaView,
} from "@/theme/components";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { Ionicons } from "@/theme/icons";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { DailyIncomeGoalCard } from "@/features/reports/components/DailyIncomeGoal";
import { useTodayReport } from "@/features/reports/hooks/use-today-report";
import { StartTripModal } from "@/features/tracking/components/StartTripModal";
import { useTracking } from "@/features/tracking/context/tracking.context";
import { useDailyGoal } from "@/features/users/hooks/use-daily-goal";
import { getPendingTrip } from "@/services/siri.service";
import { useIsTablet } from "@/hooks/use-is-tablet";
import {
  platformIcons,
  type PlatformName,
} from "../constants/platform-icons";

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
  useLanguage();

  const userQuery = useCurrentUser();
  const { saved } = useLocalSearchParams();
  const isTablet = useIsTablet();
  const { width, height } = useWindowDimensions();

  const isSmallPhone =
    !isTablet && (height <= 931 || width <= 429);

  const styles = getStyles(
    isTablet,
    isSmallPhone
  );

  const {
    isTracking,
    isReady,
    trackingNotice,
    startTrackingFromSiri,
  } = useTracking();

  const [
    showStartTripModal,
    setShowStartTripModal,
  ] = useState(false);

  const [showBanner, setShowBanner] =
    useState(false);

  const bannerTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const { data: dailyGoal } =
    useDailyGoal();

  const {
    data: todayReport,
    isLoading: todayLoading,
  } = useTodayReport();

  const todayExpenses =
    todayReport?.total_expenses.toFixed(2) ??
    "--";

  const tripBreakdown =
    todayReport?.trip_breakdown ?? [];

  const visibleTripBreakdown =
    tripBreakdown.slice(0, 3);

  const totalMiles =
    todayReport?.total_miles ?? 0;

  const hasMorePlatforms =
    tripBreakdown.length > 3;

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
      clearTimeout(
        bannerTimeoutRef.current
      );
    }

    bannerTimeoutRef.current =
      setTimeout(() => {
        setShowBanner(false);
        bannerTimeoutRef.current = null;
      }, 3000);

    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(
          bannerTimeoutRef.current
        );
      }
    };
  }, [saved]);

  useEffect(() => {
    if (!isReady) return;
    const interval = setInterval(
      async () => {
        const pendingTrip =
          await getPendingTrip();

        if (!pendingTrip) return;

        clearInterval(interval);

        if (!await startTrackingFromSiri(
          pendingTrip.platform
        )) return;

        router.replace(
          "/tracking/active"
        );
      },
      500
    );

    return () => clearInterval(interval);
  }, [isReady, startTrackingFromSiri]);

  if (todayLoading) {
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
            size={isTablet ? 20 : 18}
            color="#FFFFFF"
          />

          <Text style={styles.bannerText}>
            <Translated
              text={"Trip Saved Successfully"}
            />
          </Text>
        </View>
      )}

      {userQuery.data && (
        <View
          style={styles.welcomeContainer}
        >
          <Text style={styles.welcomeText}>
            <Text
              style={styles.welcomeLight}
            >
              <Translated
                text={greeting}
              />
            </Text>{" "}
            <Text
              style={styles.welcomeName}
            >
              {userQuery.data.first_name}!
            </Text>
          </Text>

          <Text
            style={styles.welcomeSubtitle}
          >
            <Translated
              text={subtitle}
            />
          </Text>
        </View>
      )}

      {dailyGoal && (
        <View style={styles.goalContainer}>
          <DailyIncomeGoalCard
            dailyGoal={dailyGoal}
          />
        </View>
      )}

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

        <View
          style={
            styles.offerTextContainer
          }
        >
          <Text
            style={styles.offerTitle}
          >
            <Translated
              text={"Offer Analyzer"}
            />
          </Text>

          <Text
            style={styles.offerSubtitle}
          >
            <Translated
              text={
                "See if a gig is worth your time"
              }
            />
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={isTablet ? 22 : 19}
          color="#64748B"
        />
      </Pressable>

      <View style={styles.platformCard}>
        <View
          style={styles.platformHeader}
        >
          <View
            style={
              styles.platformHeaderText
            }
          >
            <Text
              style={styles.platformTitle}
            >
              <Translated
                text={
                  "MILEAGE BREAKDOWN"
                }
              />
            </Text>

            <Text
              style={
                styles.platformSubtitle
              }
            >
              <Translated
                text={
                  "Miles tracked today"
                }
              />
            </Text>
          </View>

          <View
            style={
              styles.totalMilesContainer
            }
          >
            <Text
              style={
                styles.totalMilesValue
              }
            >
              {Number(
                totalMiles
              ).toFixed(2)}
            </Text>

            <Text
              style={
                styles.totalMilesLabel
              }
            >
              <Translated text={"miles"} />
            </Text>
          </View>
        </View>

        {visibleTripBreakdown.length >
        0 ? (
          <View
            style={styles.platformList}
          >
            {visibleTripBreakdown.map(
              (
                trip: {
                  platform: PlatformName;
                  miles: number;
                  trip_count: number;
                },
                index: number
              ) => (
                <View
                  key={`${trip.platform}-${index}`}
                  style={[
                    styles.platformRow,
                    index ===
                      visibleTripBreakdown.length -
                        1 &&
                      !hasMorePlatforms &&
                      styles.platformRowLast,
                  ]}
                >
                  <View
                    style={
                      styles.platformNameContainer
                    }
                  >
                    <Image
                      source={
                        platformIcons[
                          trip.platform
                        ] ??
                        platformIcons.other
                      }
                      style={
                        styles.platformLogo
                      }
                      resizeMode="contain"
                    />

                    <View>
                      <Text
                        style={
                          styles.platformName
                        }
                      >
                        {formatPlatformName(
                          trip.platform
                        )}
                      </Text>

                      <Text
                        style={
                          styles.platformTripCount
                        }
                      >
                        {trip.trip_count}{" "}
                        {trip.trip_count ===
                        1 ? (
                          <Translated
                            text={"trip"}
                          />
                        ) : (
                          <Translated
                            text={"trips"}
                          />
                        )}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={
                      styles.platformMiles
                    }
                  >
                    {Number(
                      trip.miles
                    ).toFixed(2)}{" "}
                    <Translated
                      text={"mi"}
                    />
                  </Text>
                </View>
              )
            )}
          </View>
        ) : (
          <View
            style={styles.emptyMileage}
          >
            <Ionicons
              name="car-outline"
              size={isTablet ? 24 : 21}
              color="#94A3B8"
            />

            <Text
              style={
                styles.emptyMileageText
              }
            >
              <Translated
                text={
                  "No miles tracked today"
                }
              />
            </Text>
          </View>
        )}

        <Pressable
          onPress={() =>
            router.push(
              "/(tabs)/activity"
            )
          }
          style={({ pressed }) => [
            styles.seeMoreButton,
            pressed &&
              styles.seeMoreButtonPressed,
          ]}
        >
          <Text
            style={styles.seeMoreText}
          >
            <Translated
              text={"View your trips"}
            />
          </Text>

          <Ionicons
            name="chevron-forward"
            size={isTablet ? 18 : 16}
            color="#4A6FE3"
          />
        </Pressable>
      </View>

      <View style={styles.expenseCard}>
        <View
          style={styles.expenseHeader}
        >
          <View
            style={styles.expenseIcon}
          >
            <Ionicons
              name="receipt-outline"
              size={isTablet ? 20 : 17}
              color="#F4B942"
            />
          </View>

          <View>
            <Text
              style={styles.expenseTitle}
            >
              <Translated
                text={"EXPENSES"}
              />
            </Text>

            <Text
              style={
                styles.expenseSubtitle
              }
            >
              <Translated
                text={
                  "Expenses recorded today"
                }
              />
            </Text>
          </View>

          <Text
            style={styles.expenseAmount}
          >
            ${todayExpenses}
          </Text>
        </View>
      </View>

      <View
        style={styles.actionsContainer}
      >
        <View
          style={
            styles.actionButtonsRow
          }
        >
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed &&
                styles.actionButtonPressed,
            ]}
            onPress={() =>
              router.push(
                "/income/create"
              )
            }
          >
            <Ionicons
              name="add-circle-outline"
              size={isTablet ? 21 : 18}
              color="#4A6FE3"
            />

            <Text
              style={
                styles.actionButtonText
              }
            >
              <Translated
                text={"Add Income"}
              />
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed &&
                styles.actionButtonPressed,
            ]}
            onPress={() =>
              router.push(
                "/expense/create"
              )
            }
          >
            <Ionicons
              name="receipt-outline"
              size={isTablet ? 21 : 18}
              color="#64748B"
            />

            <Text
              style={
                styles.actionButtonText
              }
            >
              <Translated
                text={"Add Expense"}
              />
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

          <View
            style={
              styles.startTripTextContainer
            }
          >
            <Text
              style={[
                styles.startTripButtonText,
                isTracking &&
                  styles.startTripButtonTextTracking,
              ]}
            >
              {isTracking ? (
                <Translated
                  text={
                    "Trip in Progress"
                  }
                />
              ) : (
                <Translated
                  text={"Start a Trip"}
                />
              )}
            </Text>

            {!isTracking && (
              <Text
                style={styles.siriHint}
              >
                <Translated
                  text={
                    'Or say "Siri, Start a trip in Deduckly"'
                  }
                />
              </Text>
            )}
          </View>

          {!isTracking && (
            <Ionicons
              name="chevron-forward"
              size={isTablet ? 21 : 18}
              color="#FFFFFF"
            />
          )}
        </Pressable>
      </View>

      {trackingNotice && (
        <Pressable accessibilityRole="button" onPress={() => isTracking
          ? router.push("/tracking/active")
          : localizedAlert("Check trip tracking", trackingNotice)} style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, textAlign: "center", textDecorationLine: "underline" }}>
            <Translated text="Check trip tracking" />
          </Text>
        </Pressable>
      )}
      <StartTripModal
        visible={showStartTripModal}
        onClose={closeStartModal}
      />
    </SafeAreaView>
  );
}

function formatPlatformName(
  platform?: string
): string {
  const names: Record<string, string> = {
    uber_eats: "Uber Eats",
    spark: "Spark",
    doordash: "DoorDash",
    lyft: "Lyft",
    uber: "Uber",
    grubhub: "Grubhub",
    instacart: "Instacart",
    amazon_flex: "Amazon Flex",
    shipt: "Shipt",
    other: "Other",
    personal: "Personal",
  };

  if (!platform) {
    return "Other";
  }

  return (
    names[platform] ??
    platform
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
  );
}

const getStyles = (
  isTablet: boolean,
  isSmallPhone: boolean
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      paddingHorizontal: isTablet
        ? 22
        : isSmallPhone
        ? 16
        : 20,
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
      alignSelf: "center",
      zIndex: 1000,
      minHeight: isTablet
        ? 56
        : isSmallPhone
        ? 44
        : 48,
      paddingHorizontal: isTablet
        ? 20
        : isSmallPhone
        ? 14
        : 16,
      borderRadius: isTablet
        ? 16
        : isSmallPhone
        ? 13
        : 14,
      backgroundColor: "#4A6FE3",
      height: isTablet ? 80 : 100,
      width: isTablet ? 800 : 500,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 8,
      paddingBottom: 20,

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
      fontSize: isTablet
        ? 16
        : isSmallPhone
        ? 13
        : 14,
      fontWeight: "700",
    },

    welcomeContainer: {
      marginTop: isTablet
        ? 20
        : isSmallPhone
        ? 4
        : 8,
      marginBottom: isTablet
        ? 24
        : isSmallPhone
        ? 8
        : 20,
      maxWidth: isTablet
        ? 1200
        : undefined,
      alignSelf: isTablet
        ? "center"
        : undefined,
      width: isTablet
        ? "100%"
        : undefined,
    },

    welcomeText: {
      fontSize: isTablet
        ? 36
        : isSmallPhone
        ? 27
        : 28,
      lineHeight: isTablet
        ? 43
        : isSmallPhone
        ? 32
        : 34,
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
      marginTop: isSmallPhone
        ? 3
        : 5,
      fontSize: isTablet
        ? 16
        : isSmallPhone
        ? 12
        : 14,
      lineHeight: isTablet
        ? 23
        : isSmallPhone
        ? 17
        : 20,
      color: "#64748B",
      fontWeight: "500",
    },

    goalContainer: {
      maxWidth: isTablet
        ? 1200
        : undefined,
      alignSelf: isTablet
        ? "center"
        : undefined,
      width: isTablet
        ? "100%"
        : undefined,
      marginBottom: isTablet
        ? 4
        : 0,
    },

    todayHeader: {
      marginTop: isTablet
        ? 20
        : isSmallPhone
        ? 12
        : 16,
      marginBottom: isTablet
        ? 10
        : isSmallPhone
        ? 7
        : 9,
      maxWidth: isTablet
        ? 1200
        : undefined,
      alignSelf: isTablet
        ? "center"
        : undefined,
      width: isTablet
        ? "100%"
        : undefined,
    },

    todayTitle: {
      fontSize: isTablet
        ? 12
        : isSmallPhone
        ? 10
        : 11,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: "#64748B",
    },

    todaySubtitle: {
      marginTop: 2,
      fontSize: isTablet
        ? 13
        : isSmallPhone
        ? 11
        : 12,
      color: "#94A3B8",
      fontWeight: "500",
    },

    platformCard: {
      marginTop: 10,
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet
        ? 18
        : isSmallPhone
        ? 14
        : 16,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      padding: isTablet
        ? 18
        : isSmallPhone
        ? 13
        : 15,
      maxWidth: isTablet
        ? 1200
        : undefined,
      height: isTablet
        ? 270
        : isSmallPhone
        ? 210
        : 230,
      alignSelf: isTablet
        ? "center"
        : undefined,
      width: isTablet
        ? "100%"
        : undefined,

      shadowColor: "#111827",
      shadowOpacity: 0.03,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 1,
    },

    platformHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    platformHeaderText: {
      flex: 1,
      paddingLeft: 4,
    },

    platformIcon: {
      width: isTablet
        ? 38
        : isSmallPhone
        ? 32
        : 34,
      height: isTablet
        ? 38
        : isSmallPhone
        ? 32
        : 34,
      borderRadius: isTablet
        ? 11
        : 10,
      backgroundColor: "#DCE6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    platformTitle: {
      fontSize: isTablet
        ? 11
        : isSmallPhone
        ? 9
        : 10,
      fontWeight: "800",
      letterSpacing: 1.05,
      color: "#64748B",
    },

    platformSubtitle: {
      marginTop: 2,
      fontSize: isTablet
        ? 12
        : isSmallPhone
        ? 10
        : 11,
      color: "#94A3B8",
      fontWeight: "500",
    },

    totalMilesContainer: {
      alignItems: "flex-end",
      marginLeft: 8,
    },

    totalMilesValue: {
      fontSize: isTablet
        ? 18
        : isSmallPhone
        ? 15
        : 16,
      fontWeight: "800",
      color: "#111827",
    },

    totalMilesLabel: {
      marginTop: 1,
      fontSize: isTablet
        ? 10
        : isSmallPhone
        ? 8
        : 9,
      color: "#94A3B8",
      fontWeight: "600",
    },

    platformList: {
      marginTop: isTablet
        ? 12
        : isSmallPhone
        ? 9
        : 10,
    },

    platformRow: {
      minHeight: isTablet
        ? 48
        : isSmallPhone
        ? 40
        : 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },

    platformRowLast: {
      borderBottomWidth: 0,
    },

    platformNameContainer: {
      flex: 1,
      flexDirection: "row",
    },

    platformName: {
      fontSize: isTablet
        ? 14
        : isSmallPhone
        ? 12
        : 13,
      fontWeight: "700",
      color: "#334155",
    },

    platformTripCount: {
      marginTop: 1,
      fontSize: isTablet
        ? 11
        : isSmallPhone
        ? 9
        : 10,
      color: "#94A3B8",
      fontWeight: "500",
    },
    platformLogo: {
      width: 40,
      height: 40,
      marginRight: 10,
    },
    platformMiles: {
      fontSize: isTablet
        ? 14
        : isSmallPhone
        ? 12
        : 13,
      fontWeight: "800",
      color: "#111827",
    },

    seeMoreButton: {
      minHeight: isTablet
        ? 42
        : isSmallPhone
        ? 18
        : 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      marginTop: 2,
    },

    seeMoreButtonPressed: {
      opacity: 0.65,
    },

    seeMoreText: {
      color: "#4A6FE3",
      fontSize: isTablet
        ? 13
        : isSmallPhone
        ? 11
        : 12,
      fontWeight: "700",
    },

    emptyMileage: {
      minHeight: isTablet
        ? 70
        : isSmallPhone
        ? 58
        : 64,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingTop: 60,
    },

    emptyMileageText: {
      color: "#94A3B8",
      fontSize: isTablet
        ? 12
        : isSmallPhone
        ? 10
        : 11,
      fontWeight: "500",
    },

    offerAnalyzerButton: {
      minHeight: isTablet
        ? 76
        : isSmallPhone
        ? 60
        : 68,
      marginTop: isTablet
        ? 16
        : isSmallPhone
        ? 10
        : 14,
      paddingHorizontal: isTablet
        ? 18
        : isSmallPhone
        ? 13
        : 14,
      paddingVertical: isTablet
        ? 14
        : isSmallPhone
        ? 10
        : 12,
      borderRadius: isTablet
        ? 18
        : isSmallPhone
        ? 15
        : 16,
      backgroundColor: "#4a70e315",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      flexDirection: "row",
      alignItems: "center",
      maxWidth: isTablet
        ? 1200
        : undefined,
      alignSelf: isTablet
        ? "center"
        : undefined,
      width: isTablet
        ? "100%"
        : undefined,

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
      width: isTablet
        ? 46
        : isSmallPhone
        ? 37
        : 40,
      height: isTablet
        ? 46
        : isSmallPhone
        ? 37
        : 40,
      borderRadius: isTablet
        ? 14
        : isSmallPhone
        ? 11
        : 12,
      backgroundColor: "#DCE6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    offerTextContainer: {
      flex: 1,
      marginLeft: isTablet
        ? 14
        : 12,
    },

    offerTitle: {
      fontSize: isTablet
        ? 17
        : isSmallPhone
        ? 15
        : 15,
      fontWeight: "700",
      color: "#111827",
    },

    offerSubtitle: {
      marginTop: 1,
      fontSize: isTablet
        ? 13
        : isSmallPhone
        ? 11
        : 12,
      color: "#64748B",
    },

    expenseCard: {
      marginTop: isTablet
        ? 14
        : isSmallPhone
        ? 9
        : 12,
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet
        ? 18
        : isSmallPhone
        ? 14
        : 16,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      padding: isTablet
        ? 18
        : isSmallPhone
        ? 13
        : 15,
      maxWidth: isTablet
        ? 1200
        : undefined,
      alignSelf: isTablet
        ? "center"
        : undefined,
      width: isTablet
        ? "100%"
        : undefined,

      shadowColor: "#111827",
      shadowOpacity: 0.03,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 1,
    },

    expenseHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    expenseIcon: {
      width: isTablet
        ? 38
        : isSmallPhone
        ? 32
        : 34,
      height: isTablet
        ? 38
        : isSmallPhone
        ? 32
        : 34,
      borderRadius: isTablet
        ? 11
        : 10,
      backgroundColor: "#FFF7DB",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    expenseTitle: {
      fontSize: isTablet
        ? 11
        : isSmallPhone
        ? 9
        : 10,
      fontWeight: "800",
      letterSpacing: 1.05,
      color: "#64748B",
    },

    expenseSubtitle: {
      marginTop: 2,
      fontSize: isTablet
        ? 12
        : isSmallPhone
        ? 10
        : 11,
      color: "#94A3B8",
      fontWeight: "500",
    },

    expenseAmount: {
      marginLeft: "auto",
      fontSize: isTablet
        ? 16
        : isSmallPhone
        ? 13
        : 14,
      fontWeight: "800",
      color: "#111827",
    },

    actionsContainer: {
      marginTop: 8,
      marginBottom: isTablet
        ? 28
        : isSmallPhone
        ? 10
        : 18,
      paddingTop: isTablet
        ? 10
        : isSmallPhone
        ? 2
        : 4,
      maxWidth: isTablet
        ? 1200
        : undefined,
      alignSelf: isTablet
        ? "center"
        : undefined,
      width: isTablet
        ? "100%"
        : undefined,
    },

    actionButtonsRow: {
      flexDirection: "row",
      gap: isTablet
        ? 14
        : isSmallPhone
        ? 9
        : 10,
    },

    actionButton: {
      flex: 1,
      minHeight: isTablet
        ? 58
        : isSmallPhone
        ? 43
        : 46,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet
        ? 15
        : 12,
      paddingHorizontal: isTablet
        ? 16
        : isSmallPhone
        ? 9
        : 12,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      gap: isSmallPhone
        ? 5
        : 7,
    },

    actionButtonPressed: {
      backgroundColor: "#F8FAFC",
      transform: [{ scale: 0.98 }],
    },

    actionButtonText: {
      fontSize: isTablet
        ? 14
        : isSmallPhone
        ? 12
        : 13,
      fontWeight: "700",
      color: "#334155",
    },

    startTripButton: {
      marginTop: isTablet
        ? 14
        : isSmallPhone
        ? 8
        : 12,
      minHeight: isTablet
        ? 66
        : isSmallPhone
        ? 58
        : 62,
      borderRadius: isTablet
        ? 18
        : isSmallPhone
        ? 14
        : 16,
      backgroundColor: "#4A6FE3",
      paddingHorizontal: isTablet
        ? 20
        : isSmallPhone
        ? 14
        : 18,
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

    startTripTextContainer: {
      flex: 1,
      alignItems: "center",
    },

    startTripButtonText: {
      color: "#FFFFFF",
      fontSize: isTablet
        ? 18
        : isSmallPhone
        ? 15
        : 16,
      fontWeight: "700",
    },

    startTripButtonTextTracking: {
      color: "#475569",
    },

    siriHint: {
      marginTop: 2,
      color: "#DCE6FF",
      fontSize: isTablet
        ? 11
        : isSmallPhone
        ? 9
        : 10,
      fontWeight: "500",
    },
  });