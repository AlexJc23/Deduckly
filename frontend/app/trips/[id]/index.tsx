import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { BackHeader } from "@/components/ui/BackButton";
import { DeleteTripModal } from "@/features/trips/components/DeleteTripModal";
import { useDeleteTrip } from "@/features/trips/hooks/use-delete-trip";
import { useTrip } from "@/features/trips/hooks/use-trips";
import { PLATFORM_LABELS } from "@/constants/platform-labels";
import { useIsTablet } from "@/hooks/use-is-tablet";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const tripsQuery = useTrip(Number(id));
  const deleteMutation = useDeleteTrip();

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  if (tripsQuery.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (
    tripsQuery.isError ||
    !tripsQuery.data
  ) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Failed to load trip.
        </Text>
      </View>
    );
  }

  const trip = tripsQuery.data;

  const platformLabel = trip.platform
    ? PLATFORM_LABELS[
        trip.platform as keyof typeof PLATFORM_LABELS
      ] ?? "Other"
    : trip.category ?? "Unknown";

  return (
    <View style={styles.screen}>
      <BackHeader />

      <View style={styles.container}>
        <View style={styles.contentInner}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              TRIP
            </Text>

            <Text style={styles.title}>
              Trip Details
            </Text>

            <Text style={styles.subtitle}>
              {new Date(
                trip.start_time,
              ).toLocaleDateString(
                "en-US",
                DATE_OPTIONS,
              )}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  DISTANCE
                </Text>

                <Text style={styles.summaryValue}>
                  {trip.distance_miles}
                </Text>

                <Text style={styles.summaryUnit}>
                  miles
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  PLATFORM
                </Text>

                <Text
                  style={styles.summaryValueSmall}
                  numberOfLines={1}
                >
                  {platformLabel}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  CATEGORY
                </Text>

                <Text
                  style={styles.summaryValueSmall}
                  numberOfLines={1}
                >
                  {trip.category ?? "-"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              Route
            </Text>

            <View style={styles.routeContainer}>
              <View style={styles.routeLine}>
                <View style={styles.pickupDot} />

                <View style={styles.line} />

                <View style={styles.dropoffDot} />
              </View>

              <View style={styles.addresses}>
                <View style={styles.addressCard}>
                  <Text style={styles.addressLabel}>
                    PICKUP
                  </Text>

                  <Text style={styles.address}>
                    {trip.start_address ??
                      "Unknown"}
                  </Text>
                </View>

                <View style={styles.addressCard}>
                  <Text style={styles.addressLabelDropoff}>
                    DROPOFF
                  </Text>

                  <Text style={styles.address}>
                    {trip.end_address ??
                      "Unknown"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed &&
                styles.deleteButtonPressed,
            ]}
            onPress={() =>
              setShowDeleteModal(true)
            }
          >
            <Text style={styles.deleteText}>
              Delete Trip
            </Text>
          </Pressable>

          <DeleteTripModal
            visible={showDeleteModal}
            onClose={() =>
              setShowDeleteModal(false)
            }
            onDelete={async () => {
              setShowDeleteModal(false);

              await deleteMutation.mutateAsync(
                trip.id,
              );

              router.dismissTo("/activity");
            }}
          />
        </View>
      </View>
    </View>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },

    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
      paddingHorizontal: isTablet ? 34 : 20,
      paddingTop: isTablet ? 26 : 70,
    },

    contentInner: {
      width: "100%",
      maxWidth: isTablet ? 1000 : undefined,
      alignSelf: isTablet ? "center" : undefined,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F8FAFC",
    },

    errorText: {
      fontSize: isTablet ? 18 : 16,
      color: "#6B7280",
    },

    header: {
      marginBottom: isTablet ? 28 : 24,
    },

    eyebrow: {
      fontSize: isTablet ? 11 : 10,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: "#64748B",
      marginBottom: 5,
    },

    title: {
      fontSize: isTablet ? 38 : 32,
      lineHeight: isTablet ? 45 : 38,
      fontWeight: "800",
      color: "#111827",
      letterSpacing: -0.8,
    },

    subtitle: {
      marginTop: 7,
      color: "#6B7280",
      fontSize: isTablet ? 15 : 15,
      lineHeight: isTablet ? 22 : 20,
    },

    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet ? 24 : 20,
      padding: isTablet ? 28 : 20,
      borderWidth: 1,
      borderColor: "#EEF2F6",

      shadowColor: "#111827",
      shadowOpacity: isTablet ? 0.05 : 0,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: isTablet ? 2 : 0,
    },

    summaryRow: {
      flexDirection: "row",
      alignItems: "stretch",
      minHeight: isTablet ? 92 : 66,
    },

    summaryItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: isTablet ? 10 : 4,
    },

    summaryLabel: {
      fontSize: isTablet ? 10 : 8,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: "#94A3B8",
    },

    summaryValue: {
      marginTop: isTablet ? 6 : 4,
      fontSize: isTablet ? 30 : 20,
      lineHeight: isTablet ? 36 : 25,
      fontWeight: "800",
      color: "#111827",
    },

    summaryUnit: {
      marginTop: 1,
      fontSize: isTablet ? 11 : 9,
      color: "#64748B",
      fontWeight: "600",
    },

    summaryValueSmall: {
      marginTop: isTablet ? 8 : 5,
      fontSize: isTablet ? 17 : 14,
      fontWeight: "800",
      color: "#111827",
      textAlign: "center",
    },

    summaryDivider: {
      width: 1,
      backgroundColor: "#EEF2F6",
      marginVertical: isTablet ? 10 : 6,
    },

    divider: {
      height: 1,
      backgroundColor: "#EEF2F6",
      marginVertical: isTablet ? 24 : 18,
    },

    sectionTitle: {
      fontSize: isTablet ? 20 : 18,
      fontWeight: "700",
      color: "#111827",
      marginBottom: isTablet ? 18 : 12,
    },

    routeContainer: {
      flexDirection: "row",
      minHeight: isTablet ? 170 : 128,
    },

    routeLine: {
      width: isTablet ? 34 : 25,
      alignItems: "center",
      paddingTop: isTablet ? 18 : 15,
    },

    pickupDot: {
      width: isTablet ? 14 : 11,
      height: isTablet ? 14 : 11,
      borderRadius: 999,
      backgroundColor: "#2EAF4A",
      borderWidth: isTablet ? 3 : 2,
      borderColor: "#DCFCE7",
    },

    line: {
      flex: 1,
      width: 2,
      backgroundColor: "#CBD5E1",
      marginVertical: 4,
    },

    dropoffDot: {
      width: isTablet ? 14 : 11,
      height: isTablet ? 14 : 11,
      borderRadius: 999,
      backgroundColor: "#4A6FE3",
      borderWidth: isTablet ? 3 : 2,
      borderColor: "#DCE6FF",
    },

    addresses: {
      flex: 1,
      gap: isTablet ? 14 : 12,
    },

    addressCard: {
      flex: 1,
      backgroundColor: "#F9FAFB",
      borderRadius: isTablet ? 16 : 14,
      padding: isTablet ? 17 : 14,
      justifyContent: "center",
    },

    addressLabel: {
      color: "#2EAF4A",
      fontWeight: "800",
      marginBottom: 5,
      fontSize: isTablet ? 11 : 12,
      letterSpacing: 0.5,
    },

    addressLabelDropoff: {
      color: "#4A6FE3",
      fontWeight: "800",
      marginBottom: 5,
      fontSize: isTablet ? 11 : 12,
      letterSpacing: 0.5,
    },

    address: {
      color: "#374151",
      fontSize: isTablet ? 16 : 15,
      lineHeight: isTablet ? 24 : 22,
    },

    deleteButton: {
      marginTop: isTablet ? 20 : 12,
      backgroundColor: "#FEF2F2",
      borderRadius: isTablet ? 17 : 16,
      minHeight: isTablet ? 60 : 0,
      paddingVertical: isTablet ? 0 : 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#FECACA",
    },

    deleteButtonPressed: {
      backgroundColor: "#FEE2E2",
      transform: [{ scale: 0.985 }],
    },

    deleteText: {
      color: "#DC2626",
      fontSize: isTablet ? 17 : 16,
      fontWeight: "700",
    },
  });