import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

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
      <Text style={styles.messageText}>
        No income found this month.
      </Text>
    </View>
  );
}

function ErrorState() {
  return (
    <View style={styles.messageContainer}>
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
  const incomeQuery = useIncome(startDate, endDate, sort);

  const income = incomeQuery.data ?? [];

  if (incomeQuery.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
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
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <IncomeCard income={item} />
      )}
      ListEmptyComponent={EmptyState}
      contentContainerStyle={[
        styles.content,
        income.length === 0 && styles.emptyContent,
      ]}
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
    padding: 24,
  },
  messageText: {
    fontSize: 16,
    color: "#6B7280",
  },
});