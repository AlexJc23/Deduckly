import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";

import { ExpenseCard } from "./ExpenseCard";
import { useExpenses } from "../hooks/use-expenses";

type Props = {
  startDate: string;
  endDate: string;
  sort: "asc" | "desc";
};

function EmptyExpenses() {
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>
        No expenses found this month.
      </Text>
    </View>
  );
}

function ExpenseError() {
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>
        Failed to load expenses.
      </Text>
    </View>
  );
}

export function ExpenseList({
  startDate,
  endDate,
  sort,
}: Props) {
  const [refreshing, setRefreshing] =
    useState(false);

  const expensesQuery =
    useExpenses(startDate, endDate, sort);

  const expenses =
    expensesQuery.data ?? [];

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await expensesQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }

  if (expensesQuery.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (expensesQuery.isError) {
    return <ExpenseError />;
  }

  return (
    <FlatList
      data={expenses}
      style={styles.listContainer}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      keyExtractor={(item) =>
        item.id.toString()
      }
      renderItem={({ item }) => (
        <ExpenseCard expense={item} />
      )}
      contentContainerStyle={[
        styles.listContent,
        expenses.length === 0 &&
          styles.emptyListContent,
      ]}
      ListEmptyComponent={
        EmptyExpenses
      }
    />
  );
}

const styles = StyleSheet.create({
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
});