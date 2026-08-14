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
        {/* Duration */}
        <View style={styles.durationSection}>
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

        {/* Trip Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <Ionicons
              name="flag-outline"
              size={18}
              color="#111827"
            />

            <Text style={styles.detailLabel}>
              START TIME
            </Text>

            <Text style={styles.detailValue}>
              {formatStartTime(startTime)}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Ionicons
              name="speedometer-outline"
              size={18}
              color="#111827"
            />

            <Text style={styles.detailLabel}>
              DISTANCE
            </Text>

            <Text style={styles.detailValue}>
              {distanceMiles.toFixed(2)} mi
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Ionicons
              name="briefcase-outline"
              size={18}
              color="#111827"
            />

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
            size={20}
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
          <Ionicons
            name="lock-closed"
            size={18}
            color="#CBD5E1"
          />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 28,
    paddingBottom: 24,
  },

  /* Duration */

  durationSection: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 26,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },

  timer: {
    marginTop: 10,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -1.2,
    fontVariant: ["tabular-nums"],
  },

  timeFormat: {
    marginTop: 5,
    fontSize: 10,
    color: "#64748B",
  },

  /* Distance */

  distanceSection: {
    alignItems: "center",
    paddingVertical: 26,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#CBD5E1",
  },

  distanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },

  distanceValue: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.8,
  },

  distanceUnit: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
  },

  distanceHint: {
    marginTop: 5,
    fontSize: 10,
    color: "#64748B",
  },

  /* Details */

  detailsCard: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 88,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  detailItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  detailDivider: {
    width: 1,
    backgroundColor: "#CBD5E1",
    marginVertical: 10,
  },

  detailLabel: {
    marginTop: 7,
    fontSize: 8,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: 0.2,
  },

  detailValue: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
    textTransform: "capitalize",
    textAlign: "center",
  },

  /* End Trip */

  endTripButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70,
    marginTop: 26,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },

  endTripButtonPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.985 }],
  },

  stopIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  stopSquare: {
    width: 12,
    height: 12,
    borderRadius: 1,
    backgroundColor: "#111827",
  },

  endTripText: {
    flex: 1,
    marginLeft: 12,
  },

  endTripTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  endTripSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
  },

  /* Cancel */

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },

  cancelButtonPressed: {
    opacity: 0.5,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
  },

  /* Security */

securityContainer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },

  securityText: {
    marginLeft: 9,
  },

  securityTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },

  securitySubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
  },
});