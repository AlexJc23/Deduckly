import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

import { EndTripModal } from "@/features/tracking/components/EndTripModal";
import { useTracking } from "@/features/tracking/context/tracking.context";
import { IncomeModal } from "@/features/tracking/components/IncomeModal";
import { CancelTripModal } from "@/features/trips/components/CancelTripModal";

import {
  getPendingStop,
  getPendingCancel,
} from "@/services/siri.service";
import { BackHeader } from "@/components/ui/BackButton";
import { useIsTablet } from "@/hooks/use-is-tablet";

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds = seconds % 60;

  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function formatStartTime(date: Date | null) {
  if (!date) return "--";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ActiveTripScreen() {
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const [showEndModal, setShowEndModal] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [showIncomeModal, setShowIncomeModal] =
    useState(false);

  const {
    category,
    platform,
    startTime,
    distanceMiles,
    cancelTracking,
    stopTracking,
  } = useTracking();

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const seconds = Math.floor(
        (Date.now() - startTime.getTime()) / 1000
      );

      setElapsedSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const shouldCancel =
        await getPendingCancel();

      if (shouldCancel) {
        clearInterval(interval);

        cancelTracking();

        router.replace(
          "/(tabs)/dashboard"
        );

        return;
      }

      const shouldStop =
        await getPendingStop();

      if (!shouldStop) return;

      clearInterval(interval);

      const result =
        await stopTracking(null);

      if (
        result === true ||
        result === "discarded"
      ) {
        router.replace(
          "/(tabs)/dashboard"
        );
      }
    }, 500);

    return () => clearInterval(interval);
  }, [stopTracking, cancelTracking]);

  return (
    <View style={styles.container}>
      <BackHeader />

      <View style={styles.content}>
        <View style={styles.contentInner}>
          {/* Duration */}

          <View style={styles.durationSection}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                TRIP IN PROGRESS
              </Text>
            </View>

            <Text style={styles.sectionLabel}>
              DURATION
            </Text>

            <Text style={styles.timer}>
              {formatTime(elapsedSeconds)}
            </Text>

            <Text style={styles.timeFormat}>
              hh:mm:ss
            </Text>
          </View>

          {/* Distance */}

          <View style={styles.distanceSection}>
            <View style={styles.distanceContent}>
              <Text style={styles.sectionLabel}>
                DISTANCE
              </Text>

              <View style={styles.distanceRow}>
                <Text style={styles.distanceValue}>
                  {distanceMiles.toFixed(2)}
                </Text>

                <Text style={styles.distanceUnit}>
                  mi
                </Text>
              </View>

              <Text style={styles.distanceHint}>
                miles tracked
              </Text>
            </View>
          </View>

          {/* Trip Details */}

          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="flag-outline"
                  size={isTablet ? 23 : 18}
                  color="#4A6FE3"
                />
              </View>

              <Text style={styles.detailLabel}>
                START TIME
              </Text>

              <Text style={styles.detailValue}>
                {formatStartTime(startTime)}
              </Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="speedometer-outline"
                  size={isTablet ? 23 : 18}
                  color="#4A6FE3"
                />
              </View>

              <Text style={styles.detailLabel}>
                DISTANCE
              </Text>

              <Text style={styles.detailValue}>
                {distanceMiles.toFixed(2)} mi
              </Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="briefcase-outline"
                  size={isTablet ? 23 : 18}
                  color="#4A6FE3"
                />
              </View>

              <Text style={styles.detailLabel}>
                PLATFORM
              </Text>

              <Text
                style={styles.detailValue}
                numberOfLines={1}
              >
                {platform
                  ? platform.replace(
                      "_",
                      " "
                    )
                  : category === "personal"
                  ? "Personal"
                  : "Other"}
              </Text>
            </View>
          </View>

          {/* End Trip */}

          <Pressable
            onPress={() =>
              setShowEndModal(true)
            }
            style={({ pressed }) => [
              styles.endTripButton,
              pressed &&
                styles.endTripButtonPressed,
            ]}
          >
            <View style={styles.stopIcon}>
              <View style={styles.stopSquare} />
            </View>

            <View style={styles.endTripText}>
              <Text style={styles.endTripTitle}>
                Stop Trip
              </Text>

              <Text style={styles.endTripSubtitle}>
                End and save trip
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={isTablet ? 25 : 20}
              color="#94A3B8"
            />
          </Pressable>

          {/* Cancel */}

          <Pressable
            onPress={() =>
              setShowCancelModal(true)
            }
            style={({ pressed }) => [
              styles.cancelButton,
              pressed &&
                styles.cancelButtonPressed,
            ]}
          >
            <Text style={styles.cancelText}>
              Cancel Trip
            </Text>
          </Pressable>

          {/* Security */}

          <View style={styles.securityContainer}>
            <View style={styles.securityIcon}>
              <Ionicons
                name="lock-closed"
                size={isTablet ? 18 : 18}
                color="#94A3B8"
              />
            </View>

            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>
                Your trip data is securely transmitted.
              </Text>

              <Text style={styles.securitySubtitle}>
                You can stop tracking anytime.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <CancelTripModal
        visible={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
        }}
        onCancel={() => {
          setShowCancelModal(false);

          cancelTracking();

          router.push({
            pathname:
              "/(tabs)/dashboard",
            params: {
              discarded: "true",
            },
          });
        }}
      />

      <EndTripModal
        visible={showEndModal}
        onClose={() => {
          setShowEndModal(false);
        }}
        onConfirm={() => {
          setShowEndModal(false);

          setTimeout(() => {
            setShowIncomeModal(true);
          }, 350);
        }}
      />

      <IncomeModal
        visible={showIncomeModal}
        onSave={async (income) => {
          setShowIncomeModal(false);

          const result =
            await stopTracking(income);

          if (result === true) {
            router.replace({
              pathname:
                "/(tabs)/dashboard",
              params: {
                saved: "true",
              },
            });
          }

          if (result === "discarded") {
            router.replace({
              pathname:
                "/(tabs)/dashboard",
              params: {
                discarded: "true",
              },
            });
          }
        }}
        onSkip={async () => {
          setShowIncomeModal(false);

          const result =
            await stopTracking(null);

          if (result === true) {
            router.replace({
              pathname:
                "/(tabs)/dashboard",
              params: {
                saved: "true",
              },
            });
          }

          if (result === "discarded") {
            router.replace({
              pathname:
                "/(tabs)/dashboard",
              params: {
                discarded: "true",
              },
            });
          }
        }}
      />
    </View>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },

    content: {
      flex: 1,
      paddingHorizontal: isTablet ? 34 : 12,
      paddingTop: isTablet ? 18 : 28,
      paddingBottom: isTablet ? 30 : 24,
    },

    contentInner: {
      flex: 1,
      width: "100%",
      maxWidth: isTablet ? 900 : undefined,
      alignSelf: isTablet ? "center" : undefined,
    },

    /* Duration */

    durationSection: {
      alignItems: "center",
      paddingTop: isTablet ? 8 : 10,
      paddingBottom: isTablet ? 24 : 26,
    },

    liveBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isTablet ? 14 : 11,
      height: isTablet ? 32 : 26,
      borderRadius: isTablet ? 16 : 13,
      backgroundColor: "#ECFDF3",
      borderWidth: 1,
      borderColor: "#BBF7D0",
      marginBottom: isTablet ? 18 : 13,
    },

    liveDot: {
      width: isTablet ? 8 : 6,
      height: isTablet ? 8 : 6,
      borderRadius: 10,
      backgroundColor: "#22C55E",
      marginRight: 7,
    },

    liveText: {
      fontSize: isTablet ? 11 : 9,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: "#16A34A",
    },

    sectionLabel: {
      fontSize: isTablet ? 12 : 10,
      fontWeight: "700",
      color: "#64748B",
      letterSpacing: isTablet ? 0.8 : 0.5,
    },

    timer: {
      marginTop: isTablet ? 12 : 10,
      fontSize: isTablet ? 64 : 38,
      lineHeight: isTablet ? 72 : 44,
      fontWeight: "800",
      color: "#111827",
      letterSpacing: isTablet ? -2 : -1.2,
      fontVariant: ["tabular-nums"],
    },

    timeFormat: {
      marginTop: isTablet ? 8 : 5,
      fontSize: isTablet ? 12 : 10,
      color: "#64748B",
    },

    /* Distance */

    distanceSection: {
      alignItems: "center",
      paddingVertical: isTablet ? 26 : 26,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: "#CBD5E1",
    },

    distanceContent: {
      alignItems: "center",
    },

    distanceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginTop: isTablet ? 10 : 8,
    },

    distanceValue: {
      fontSize: isTablet ? 54 : 34,
      lineHeight: isTablet ? 62 : 38,
      fontWeight: "800",
      color: "#111827",
      letterSpacing: isTablet ? -1.2 : -0.8,
      fontVariant: ["tabular-nums"],
    },

    distanceUnit: {
      marginLeft: isTablet ? 8 : 5,
      fontSize: isTablet ? 22 : 16,
      fontWeight: "700",
      color: "#475569",
    },

    distanceHint: {
      marginTop: isTablet ? 7 : 5,
      fontSize: isTablet ? 12 : 10,
      color: "#64748B",
    },

    /* Details */

    detailsCard: {
      flexDirection: "row",
      alignItems: "stretch",
      minHeight: isTablet ? 132 : 88,
      marginTop: isTablet ? 24 : 24,
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: isTablet ? 18 : 10,
      backgroundColor: "#FFFFFF",

      shadowColor: "#111827",
      shadowOpacity: isTablet ? 0.04 : 0,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: isTablet ? 1 : 0,
    },

    detailItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: isTablet ? 10 : 4,
    },

    detailIcon: {
      width: isTablet ? 42 : 0,
      height: isTablet ? 42 : 0,
      borderRadius: isTablet ? 13 : 0,
      backgroundColor: isTablet
        ? "#EEF2FF"
        : "transparent",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isTablet ? 7 : 0,
    },

    detailDivider: {
      width: 1,
      backgroundColor: "#CBD5E1",
      marginVertical: isTablet ? 16 : 10,
    },

    detailLabel: {
      marginTop: isTablet ? 0 : 7,
      fontSize: isTablet ? 10 : 8,
      fontWeight: "600",
      color: "#475569",
      letterSpacing: isTablet ? 0.4 : 0.2,
    },

    detailValue: {
      marginTop: isTablet ? 6 : 5,
      fontSize: isTablet ? 14 : 10,
      fontWeight: "800",
      color: "#111827",
      textTransform: "capitalize",
      textAlign: "center",
    },

    /* End Trip */

    endTripButton: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: isTablet ? 84 : 70,
      marginTop: isTablet ? 26 : 26,
      paddingHorizontal: isTablet ? 24 : 20,
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: isTablet ? 18 : 14,
      backgroundColor: "#FFFFFF",

      shadowColor: "#111827",
      shadowOpacity: isTablet ? 0.04 : 0,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: isTablet ? 1 : 0,
    },

    endTripButtonPressed: {
      backgroundColor: "#F8FAFC",
      transform: [{ scale: 0.985 }],
    },

    stopIcon: {
      width: isTablet ? 50 : 38,
      height: isTablet ? 50 : 38,
      borderRadius: isTablet ? 25 : 19,
      borderWidth: isTablet ? 2.5 : 2,
      borderColor: "#111827",
      alignItems: "center",
      justifyContent: "center",
    },

    stopSquare: {
      width: isTablet ? 16 : 12,
      height: isTablet ? 16 : 12,
      borderRadius: 2,
      backgroundColor: "#111827",
    },

    endTripText: {
      flex: 1,
      marginLeft: isTablet ? 16 : 12,
    },

    endTripTitle: {
      fontSize: isTablet ? 18 : 15,
      fontWeight: "700",
      color: "#111827",
    },

    endTripSubtitle: {
      marginTop: isTablet ? 4 : 3,
      fontSize: isTablet ? 12 : 10,
      color: "#64748B",
    },

    /* Cancel */

    cancelButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: isTablet ? 18 : 16,
    },

    cancelButtonPressed: {
      opacity: 0.5,
    },

    cancelText: {
      fontSize: isTablet ? 15 : 14,
      fontWeight: "700",
      color: "#DC2626",
    },

    /* Security */

    securityContainer: {
      marginTop: "auto",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: isTablet ? 18 : 18,
    },

    securityIcon: {
      width: isTablet ? 38 : 0,
      height: isTablet ? 38 : 0,
      borderRadius: isTablet ? 12 : 0,
      backgroundColor: isTablet
        ? "#F1F5F9"
        : "transparent",
      alignItems: "center",
      justifyContent: "center",
    },

    securityText: {
      marginLeft: isTablet ? 10 : 9,
    },

    securityTitle: {
      fontSize: isTablet ? 11 : 10,
      fontWeight: "600",
      color: "#64748B",
    },

    securitySubtitle: {
      marginTop: 3,
      fontSize: isTablet ? 11 : 10,
      color: "#94A3B8",
    },
  });