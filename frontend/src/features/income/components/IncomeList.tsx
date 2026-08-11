import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { IncomeCard } from "./IncomeCard";
import { useIncome } from "../hooks/use-income";

interface IncomeListProps {
  startDate: string;
  endDate: string;
  sort: "asc" | "desc";
}

function EmptyState() {
  return (
    <View style={styles.messageContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="wallet-outline"
          size={22}
          color="#64748B"
        />
      </View>

      <Text style={styles.emptyTitle}>
        No income yet
      </Text>

      <Text style={styles.messageText}>
        No income found this month.
      </Text>
    </View>
  );
}

function ErrorState() {
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
        Failed to load income.
      </Text>
    </View>
  );
}

export function IncomeList({
  startDate,
  endDate,
  sort,
}: IncomeListProps) {
  const incomeQuery = useIncome(
    startDate,
    endDate,
    sort,
  );

  const income = incomeQuery.data ?? [];

  if (incomeQuery.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color="#4A6FE3"
        />
      </View>
    );
  }

  if (incomeQuery.isError) {
    return <ErrorState />;
  }

  return (
    <FlatList
      data={income}
      style={styles.list}
      refreshing={incomeQuery.isRefetching}
      onRefresh={incomeQuery.refetch}
      keyExtractor={(item) =>
        item.id.toString()
      }
      renderItem={({ item }) => (
        <IncomeCard income={item} />
      )}
      ListEmptyComponent={EmptyState}
      contentContainerStyle={[
        styles.content,
        income.length === 0 &&
          styles.emptyContent,
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },

  content: {
    paddingBottom: 40,
  },

  emptyContent: {
    flexGrow: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
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
});