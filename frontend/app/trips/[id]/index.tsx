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
    <View style={{ flex: 1 }}>
      <BackHeader />

      <View style={styles.container}>
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

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>
              Platform
            </Text>

            <Text style={styles.value}>
              {platformLabel}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Distance
            </Text>

            <Text style={styles.value}>
              {trip.distance_miles} mi
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Category
            </Text>

            <Text style={styles.value}>
              {trip.category ?? "-"}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            Route
          </Text>

          <View style={styles.addressCard}>
            <Text
              style={styles.addressLabel}
            >
              Pickup
            </Text>

            <Text style={styles.address}>
              {trip.start_address ??
                "Unknown"}
            </Text>
          </View>

          <View style={styles.addressCard}>
            <Text
              style={styles.addressLabel}
            >
              Dropoff
            </Text>

            <Text style={styles.address}>
              {trip.end_address ??
                "Unknown"}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.deleteButton}
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
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 70,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  errorText: {
    fontSize: 16,
    color: "#6B7280",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 24,
    color: "#6B7280",
    fontSize: 15,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  label: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },

  value: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F6",
    marginVertical: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  addressCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  addressLabel: {
    color: "#2EAF4A",
    fontWeight: "700",
    marginBottom: 4,
    fontSize: 12,
    textTransform: "uppercase",
  },

  address: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 22,
  },

  deleteButton: {
    marginTop: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  deleteText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "700",
  },
});