import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { Expense } from "../types/expense";
import { EXPENSE_CATEGORY_LABELS } from "@/constants/expense-category-labels";

type Props = {
  expense: Expense;
};

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
};

export function ExpenseCard({
  expense,
}: Props) {
  const category =
    EXPENSE_CATEGORY_LABELS[
      expense.category
    ] ?? "Other";

  const date = new Date(
    expense.incurred_at,
  ).toLocaleDateString(
    "en-US",
    DATE_OPTIONS,
  );

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push(
          `/expense/${expense.id}`,
        )
      }
    >
      <View style={styles.header}>
        <Text style={styles.category}>
          {category}
        </Text>

        <Text style={styles.chevron}>
          ›
        </Text>
      </View>

      <Text style={styles.amount}>
        $
        {Number(
          expense.amount,
        ).toFixed(2)}
      </Text>

      <Text style={styles.merchant}>
        {expense.merchant ??
          "Unknown Merchant"}
      </Text>

      <Text style={styles.date}>
        {date}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  category: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  chevron: {
    fontSize: 24,
    color: "#9CA3AF",
  },

  amount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#DC2626",
  },

  merchant: {
    marginTop: 4,
    fontSize: 15,
    color: "#374151",
  },

  date: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
  },
});