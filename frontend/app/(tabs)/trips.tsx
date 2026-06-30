import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { useTrips } from "@/features/trips/hooks/use-trips";
import { router } from "expo-router";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
};

function TripListEmpty() {
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>No trips found</Text>
    </View>
  );
}

function TripListError() {
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>Failed to load trips</Text>
    </View>
  );
}

function TripItem({ item }: { item: any }) {
  const dateLabel = new Date(item.created_at).toLocaleDateString(
    "en-US",
    DATE_OPTIONS
  );
  const platformLabel = item.platform ?? item.category ?? "Unknown";

  return (
    <Pressable
      onPress={() => router.push(`/trips/${item.id}/`)}
      style={styles.tripItem}
    >
      <Text style={styles.tripDistance}>{item.distance_miles} miles</Text>
      <Text style={styles.tripMeta}>{`${dateLabel} · ${platformLabel}`}</Text>
    </Pressable>
  );
}

export default function TripsScreen() {
  const tripsQuery = useTrips();

  if (tripsQuery.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (tripsQuery.isError) {
    return <TripListError />;
  }

  if (!tripsQuery.data?.length) {
    return <TripListEmpty />;
  }

  return (
    <FlatList
      style={styles.listContainer}
      data={tripsQuery.data}
      refreshing={tripsQuery.isRefetching}
      onRefresh={() => tripsQuery.refetch()}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <TripItem item={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={TripListEmpty}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  messageText: {
    fontSize: 16,
  },
  listContent: {
    paddingVertical: 8,
  },
  listContainer: {
    flex: 1,
    alignContent: "center",
    marginTop: 30
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  tripItem: {
    padding: 20,
    backgroundColor: "#fff",
  },
  tripDistance: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  tripMeta: {
    fontSize: 14,
    color: "#666",
  },
});
