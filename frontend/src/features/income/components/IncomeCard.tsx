import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

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
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() =>
        router.push(`/income/${income.id}`)
      }
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="arrow-down"
              size={17}
              color="#22C55E"
            />
          </View>

          <View style={styles.titleContent}>
            <Text
              style={styles.title}
              numberOfLines={1}
            >
              {title}
            </Text>

            <Text style={styles.type}>
              {income.source === "gig_platform"
                ? "Gig income"
                : "Business income"}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#94A3B8"
        />
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amount}>
          ${Number(income.amount).toFixed(2)}
        </Text>

        <Text style={styles.date}>
          {date}
        </Text>
      </View>

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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },

  cardPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.99 }],
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  titleContent: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  type: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 15,
  },

  amount: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#22C55E",
  },

  date: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  notes: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
});