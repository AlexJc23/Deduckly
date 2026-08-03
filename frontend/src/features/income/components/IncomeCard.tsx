import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { Income } from "../types/income";
import { PLATFORM_LABELS } from "../../../constants/platform-labels";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
};

interface IncomeCardProps {
  income: Income;
}

export function IncomeCard({
  income,
}: IncomeCardProps) {
  const date = new Date(
    income.received_at ?? income.created_at,
  ).toLocaleDateString("en-US", DATE_OPTIONS);


    const title =
    income.source === "gig_platform"
        ? PLATFORM_LABELS[income.platform ?? "other"]
        : income.business_name ?? "Business";

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push(`/income/${income.id}`)
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          💵 {title}
        </Text>

        <Text style={styles.chevron}>
          ›
        </Text>
      </View>

      <Text style={styles.amount}>
        ${Number(income.amount).toFixed(2)}
      </Text>

      <Text style={styles.date}>
        {date}
      </Text>

      {income.notes ? (
        <Text
          style={styles.notes}
          numberOfLines={2}
        >
          {income.notes}
        </Text>
      ) : null}
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
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  chevron: {
    fontSize: 24,
    color: "#9CA3AF",
  },
  amount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#16A34A",
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
  },
  notes: {
    marginTop: 8,
    fontSize: 14,
    color: "#4B5563",
  },
});