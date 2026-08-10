import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Expense } from "../types/expense";
import { EXPENSE_CATEGORY_LABELS } from "@/constants/expense-category-labels";

type Props = {
  expense: Expense;
};

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
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
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() =>
        router.push(
          `/expense/${expense.id}`,
        )
      }
    >
      <View style={styles.topRow}>
        <View style={styles.categoryContainer}>
          <View style={styles.categoryIcon}>
            <Ionicons
              name="receipt-outline"
              size={16}
              color="#4A6FE3"
            />
          </View>

          <View>
            <Text style={styles.category}>
              {category}
            </Text>

            <Text style={styles.merchant}>
              {expense.merchant ??
                "Unknown Merchant"}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            -$
            {Number(
              expense.amount,
            ).toFixed(2)}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color="#94A3B8"
          />

          <Text style={styles.date}>
            {date}
          </Text>
        </View>

        <View style={styles.businessBadge}>
          <Text style={styles.businessText}>
            Expense
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },

  cardPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.99 }],
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  category: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  merchant: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    gap: 6,
  },

  amount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#DC2626",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 11,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  date: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },

  businessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#F1F5F9",
  },

  businessText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});