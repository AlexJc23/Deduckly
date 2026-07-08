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
import { useState } from "react";
import { SortTripsModal } from "@/features/trips/components/SortTripsModal";
import { DateFilterModal } from "@/features/trips/components/DateFilterModal";

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
      <Text style={styles.messageText}>
        Failed to load trips
      </Text>
    </View>
  );
}

function formatDate(date: Date | null) {
  if (!date) return undefined;

  return date.toISOString().split("T")[0];
};

function TripItem({ item }: { item: any }) {
  const dateLabel = new Date(
    item.created_at
  ).toLocaleDateString("en-US", DATE_OPTIONS);

  const platformLabel =
    item.platform ?? item.category ?? "Unknown";

  return (
    <Pressable
      onPress={() =>
        router.push(`/trips/${item.id}/`)
      }
      style={styles.tripItem}
    >
      <Text style={styles.tripDistance}>
        {item.distance_miles} miles
      </Text>

      <Text style={styles.tripMeta}>
        {dateLabel} · {platformLabel}
      </Text>
    </Pressable>
  );
}


export default function TripsScreen() {
  const [startDate, setStartDate] =
    useState<Date | null>(null);

  const [endDate, setEndDate] =
    useState<Date | null>(null);

  const [sort, setSort] =
  useState<"desc" | "asc">("desc");
  const [showSortModal, setShowSortModal] = useState(false)


  const tripsQuery = useTrips(
    formatDate(startDate),
    formatDate(endDate),
    sort
  );


  const trips = tripsQuery.data ?? [];

  let content;

  if (tripsQuery.isPending) {
    content = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  } else if (tripsQuery.isError) {
    content = <TripListError />;
  } else {
    content = (
      <FlatList
        data={trips}
        style={styles.listContainer}
        refreshing={tripsQuery.isRefetching}
        onRefresh={tripsQuery.refetch}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={({ item }) => (
          <TripItem item={item} />
        )}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        contentContainerStyle={[
          styles.listContent,
          trips.length === 0 &&
            styles.emptyListContent,
        ]}
        ListEmptyComponent={TripListEmpty}
      />
    );
  }
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>Hello World!</Text>
        <Text>{startDate ? startDate.toLocaleDateString("en-US", DATE_OPTIONS) : ""}</Text>
        <Pressable onPress={() => setShowSortModal(true)}>
          <Text>Sort</Text>
        </Pressable>
        <Pressable onPress={() => setShowDateFilterModal(true)}>
          <Text>Filter</Text>
          <Text>{startDate ? startDate.toLocaleDateString("en-US", DATE_OPTIONS) : ""}</Text>
          <Text>{endDate ? endDate.toLocaleDateString("en-US", DATE_OPTIONS) : ""}</Text>

        </Pressable>
      </View>

      {content}
      <SortTripsModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        value={sort}
        onChange={setSort}
      />
      <DateFilterModal
        visible={showDateFilterModal}
        onClose={() => setShowDateFilterModal(false)}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClear={() => {
          setStartDate(null);
          setEndDate(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 90,
    width: "90%",
    alignSelf: "center",
  },

  header: {
    marginBottom: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContainer: {
    flex: 1,
  },

  listContent: {
    paddingVertical: 8,
  },

  emptyListContent: {
    flexGrow: 1,
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
