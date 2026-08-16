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
import Ionicons from "@expo/vector-icons/Ionicons";

import { SortTripsModal } from "@/features/trips/components/SortTripsModal";
import { useTrips } from "@/features/trips/hooks/use-trips";
import { IncomeList } from "@/features/income/components/IncomeList";
import { PLATFORM_LABELS } from "../../src/constants/platform-labels";
import { Trip } from "@/features/trips/types/trips.types";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { ActivityDateFilter } from "@/features/activity/components/ActivityDateFilter";
import {
  ActivityDateModal,
  ActivityDateOption,
} from "@/features/activity/modals/ActivtiyDateModal";
import { usePremium } from "@/features/subscriptions/hooks/use-premium";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
};

type TabValue = "trips" | "income" | "expenses";
type SortValue = "desc" | "asc";

function TripListEmpty() {
  return (
    <View style={styles.messageContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="car-outline"
          size={22}
          color="#64748B"
        />
      </View>

      <Text style={styles.emptyTitle}>
        No trips yet
      </Text>

      <Text style={styles.messageText}>
        No trips found for this period.
      </Text>
    </View>
  );
}

function TripListError() {
  return (
    <View style={styles.messageContainer}>
      <View style={styles.errorIcon}>
        <Ionicons
          name="alert-circle-outline"
          size={22}
          color="#EF4444"
        />
      </View>

      <Text style={styles.emptyTitle}>
        Something went wrong
      </Text>

      <Text style={styles.messageText}>
        Failed to load trips.
      </Text>
    </View>
  );
}

function TripItem({ item }: { item: Trip }) {
  const dateLabel = new Date(
    item.start_time,
  ).toLocaleDateString(
    "en-US",
    DATE_OPTIONS,
  );

  const platformLabel = item.platform
    ? PLATFORM_LABELS[
        item.platform as keyof typeof PLATFORM_LABELS
      ]
    : "Unknown";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tripItem,
        pressed && styles.tripItemPressed,
      ]}
      onPress={() =>
        router.push(`/trips/${item.id}/`)
      }
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripTitleContainer}>
          <View style={styles.tripIcon}>
            <Ionicons
              name="car-outline"
              size={17}
              color="#4A6FE3"
            />
          </View>

          <View style={styles.tripTitleContent}>
            <Text
              style={styles.tripPlatform}
              numberOfLines={1}
            >
              {platformLabel}
            </Text>

            <Text style={styles.tripType}>
              Trip
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#94A3B8"
        />
      </View>

      <View style={styles.tripDetails}>
        <Text style={styles.tripDistance}>
          {item.distance_miles} mi
        </Text>

        <Text style={styles.tripDate}>
          {dateLabel}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ActivityScreen() {
  const [tab, setTab] =
    useState<TabValue>("trips");

  const [sort, setSort] =
    useState<SortValue>("desc");

  const [showSortModal, setShowSortModal] =
    useState(false);

  const { isPremium } = usePremium();


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
    sort,
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
          <ActivityIndicator
            size="small"
            color="#4A6FE3"
          />
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
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={({ item }) => (
          <TripItem item={item} />
        )}
        contentContainerStyle={[
          styles.listContent,
          trips.length === 0 &&
            styles.emptyListContent,
        ]}
        ListEmptyComponent={TripListEmpty}
        showsVerticalScrollIndicator={false}
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
    return (
      <ExpenseList
        startDate={startDate}
        endDate={endDate}
        sort={sort}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>

        <Text style={styles.title}>
          Activity
        </Text>

        <Text style={styles.subtitle}>
          Track your trips, income, and expenses.
        </Text>
      </View>

      <View style={styles.segment}>
        <Pressable
          style={({ pressed }) => [
            styles.segmentButton,
            tab === "trips" &&
              styles.segmentButtonActive,
            pressed &&
              styles.segmentButtonPressed,
          ]}
          onPress={() => setTab("trips")}
        >
          <Ionicons
            name={
              tab === "trips"
                ? "car"
                : "car-outline"
            }
            size={16}
            color={
              tab === "trips"
                ? "#4A6FE3"
                : "#64748B"
            }
          />

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
          style={({ pressed }) => [
            styles.segmentButton,
            tab === "income" &&
              styles.segmentButtonActive,
            pressed &&
              styles.segmentButtonPressed,
          ]}
          onPress={() => setTab("income")}
        >
          <Ionicons
            name={
              tab === "income"
                ? "arrow-down-circle"
                : "arrow-down-circle-outline"
            }
            size={16}
            color={
              tab === "income"
                ? "#4A6FE3"
                : "#64748B"
            }
          />

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
          style={({ pressed }) => [
            styles.segmentButton,
            tab === "expenses" &&
              styles.segmentButtonActive,
            pressed &&
              styles.segmentButtonPressed,
          ]}
          onPress={() => setTab("expenses")}
        >
          <Ionicons
            name={
              tab === "expenses"
                ? "arrow-up-circle"
                : "arrow-up-circle-outline"
            }
            size={16}
            color={
              tab === "expenses"
                ? "#4A6FE3"
                : "#64748B"
            }
          />

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

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed &&
              styles.actionButtonPressed,
          ]}
          onPress={() =>
            setShowSortModal(true)
          }
        >
          <Ionicons
            name="swap-vertical-outline"
            size={16}
            color="#64748B"
          />

          <Text style={styles.actionText}>
            {sort === "desc"
              ? "Newest"
              : "Oldest"}
          </Text>

          <Ionicons
            name="chevron-down"
            size={14}
            color="#94A3B8"
          />
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
        // onUpgrade={() => {
        //   // router.push("/premium")
        // }}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 72,
    width: "90%",
    alignSelf: "center",
  },

  header: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#64748B",
    marginBottom: 4,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    marginTop: 4,
  },

  segment: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },

  segmentButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 10,
  },

  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  segmentButtonPressed: {
    transform: [{ scale: 0.98 }],
  },

  segmentText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 13,
  },

  segmentTextActive: {
    color: "#111827",
    fontWeight: "700",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },

  actionButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 7,
  },

  actionButtonPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.98 }],
  },

  actionText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 13,
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

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  messageText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
  },

  tripItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },

  tripItemPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.99 }],
  },

  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tripTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  tripIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  tripTitleContent: {
    flex: 1,
  },

  tripPlatform: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  tripType: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  tripDetails: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 15,
  },

  tripDistance: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#4A6FE3",
  },

  tripDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
});