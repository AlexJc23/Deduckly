import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SortTripsModal } from "@/features/trips/components/SortTripsModal";
import { useTrips } from "@/features/trips/hooks/use-trips";
import { IncomeList } from "@/features/income/components/IncomeList";
import { PLATFORM_LABELS } from "../../src/constants/platform-labels";
import { Trip } from "@/features/trips/types/trips.types";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { ActivityDateFilter } from "@/features/activity/components/ActivityDateFilter";
import { ActivityDateModal, ActivityDateOption } from "@/features/activity/modals/ActivtiyDateModal";


const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
};

type TabValue = "trips" | "income" | "expenses";
type SortValue = "desc" | "asc";

function TripListEmpty() {
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>No trips found this month.</Text>
    </View>
  );
}

function TripListError() {
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>Failed to load trips.</Text>
    </View>
  );
}

function TripItem({ item }: { item: Trip }) {
  const dateLabel = new Date(item.start_time).toLocaleDateString(
    "en-US",
    DATE_OPTIONS,
  );


  const platformLabel =
    item.platform
      ? PLATFORM_LABELS[item.platform as keyof typeof PLATFORM_LABELS]
      : "Unknown";

  return (
    <Pressable
      style={styles.tripItem}
      onPress={() => router.push(`/trips/${item.id}/`)}
    >
      <View style={styles.tripHeader}>
        <Text style={styles.tripPlatform}>🚗 {platformLabel}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>

      <Text style={styles.tripDistance}>
        {item.distance_miles} mi
      </Text>

      <Text style={styles.tripDate}>
        {dateLabel}
      </Text>
    </Pressable>
  );
}

export default function ActivityScreen() {
  const [tab, setTab] = useState<TabValue>("trips");
  const [sort, setSort] = useState<SortValue>("desc");
  const [showSortModal, setShowSortModal] = useState(false);
  const isPremium = false; // Replace with actual logic to determine if the user is premium
  
  // Date filtering state
  const [showDateModal, setShowDateModal] =
  useState(false);
  const [dateLabel, setDateLabel] =
    useState("Current Month");

  const now = new Date();

  const currentMonthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const currentMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  )
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] =
    useState(currentMonthStart);

  const [endDate, setEndDate] =
    useState(currentMonthEnd);

  
  const tripsQuery = useTrips(
    startDate, 
    endDate,
    sort
  );

  const trips = tripsQuery.data ?? [];

  function formatDate(date: Date) {
    return date
      .toISOString()
      .split("T")[0];
  }

  function handlePresetDate(
  option: Exclude<
    ActivityDateOption,
    "custom"
  >,
) {
  const today = new Date();

  switch (option) {
    case "current": {
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      );

      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
      setDateLabel("Current Month");

      break;
    }

    case "last": {
      const start = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
      );

      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
      setDateLabel("Last Month");

      break;
    }

    case "year": {
      const start = new Date(
        today.getFullYear(),
        0,
        1,
      );

      const end = new Date(
        today.getFullYear(),
        11,
        31,
      );

      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
      setDateLabel("This Year");

      break;
    }
  }
}

  function renderTrips() {
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

    return (
      <FlatList
        data={trips}
        style={styles.listContainer}
        refreshing={tripsQuery.isRefetching}
        onRefresh={tripsQuery.refetch}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TripItem item={item} />
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

 function renderIncome() {
  return (
    <IncomeList
      startDate={startDate}
      endDate={endDate}
      sort={sort}
    />
  );
}

  function renderExpenses() {
   return <ExpenseList 
          startDate={startDate}
          endDate={endDate}
          sort={sort} 
          />;
}

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Activity
        </Text>

        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString(
            "en-US",
            {
              month: "long",
              year: "numeric",
            },
          )}
        </Text>
      </View>

      <View style={styles.segment}>
        <Pressable
          style={[
            styles.segmentButton,
            tab === "trips" &&
              styles.segmentButtonActive,
          ]}
          onPress={() => setTab("trips")}
        >
          <Text
            style={[
              styles.segmentText,
              tab === "trips" &&
                styles.segmentTextActive,
            ]}
          >
            Trips
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.segmentButton,
            tab === "income" &&
              styles.segmentButtonActive,
          ]}
          onPress={() => setTab("income")}
        >
          <Text
            style={[
              styles.segmentText,
              tab === "income" &&
                styles.segmentTextActive,
            ]}
          >
            Income
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.segmentButton,
            tab === "expenses" &&
              styles.segmentButtonActive,
          ]}
          onPress={() => setTab("expenses")}
        >
          <Text
            style={[
              styles.segmentText,
              tab === "expenses" &&
                styles.segmentTextActive,
            ]}
          >
            Expenses
          </Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <ActivityDateFilter
          label={dateLabel}
          onPress={() =>
            setShowDateModal(true)
          }
        />

        {/* <Pressable
          style={styles.actionButton}
          onPress={() =>
            setShowSortModal(true)
          }
        /> */}
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            setShowSortModal(true)
          }
        >
          <Text style={styles.actionIcon}>
            ↕
          </Text>

          <Text style={styles.actionText}>
            {sort === "desc"
              ? "Newest"
              : "Oldest"}
          </Text>
        </Pressable>
      </View>

      {tab === "trips" && renderTrips()}
      {tab === "income" && renderIncome()}
      {tab === "expenses" &&
        renderExpenses()}
      <ActivityDateModal
        visible={showDateModal}
        isPremium={isPremium}
        onClose={() =>
          setShowDateModal(false)
        }
        onUpgrade={() =>
          // router.push("/premium")
          {}
        }
        onSelectPreset={
          handlePresetDate
        }
        onApplyCustom={(
          start,
          end,
        ) => {
          setStartDate(
            formatDate(start),
          );

          setEndDate(
            formatDate(end),
          );

          setDateLabel(
            "Custom Range",
          );
        }}
      />
      <SortTripsModal
        visible={showSortModal}
        onClose={() =>
          setShowSortModal(false)
        }
        value={sort}
        onChange={setSort}
      />
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 90,
    width: "90%",
    alignSelf: "center",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },
  segmentText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 15,
  },
  segmentTextActive: {
    color: "#111827",
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
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
    paddingBottom: 32,
    gap: 12,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  messageText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  tripItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tripPlatform: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  chevron: {
    fontSize: 24,
    color: "#9CA3AF",
  },
  tripDistance: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  tripDate: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 14,
  },
});