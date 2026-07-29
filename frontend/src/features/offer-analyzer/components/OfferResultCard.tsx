import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { OfferResult } from "../types/offer.types";

type OfferResultCardProps = {
  result: OfferResult;
};

export function OfferResultCard({
  result,
}: OfferResultCardProps) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              result.color + "18",
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: result.color },
          ]}
        >
          {result.verdict.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.dpm}>
        ${result.dollarsPerMile.toFixed(2)}/mi
      </Text>

      <View style={styles.statRow}>
        <Text style={styles.label}>
          Hourly
        </Text>

        <Text style={styles.value}>
          ${result.hourlyRate.toFixed(0)}/hr
        </Text>
      </View>

      <View style={styles.divider} />

      {result.reasons.map((reason, index) => {
        const isNegative =
          reason.toLowerCase().includes("low") ||
          reason.toLowerCase().includes("poor") ||
          reason.toLowerCase().includes("skip") ||
          reason.toLowerCase().includes("bad");

        return (
          <View
            key={index}
            style={styles.reasonRow}
          >
            <View
              style={[
                styles.icon,
                isNegative
                  ? styles.negativeIcon
                  : styles.positiveIcon,
              ]}
            >
              <Text
                style={[
                  styles.iconText,
                  isNegative
                    ? styles.negativeIconText
                    : styles.positiveIconText,
                ]}
              >
                {isNegative ? "✕" : "✓"}
              </Text>
            </View>

            <Text style={styles.reason}>
              {reason}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,          // was 18
    gap: 8,               // was 12
    borderWidth: 1,
    borderColor: "#EEF2F6",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
        width: 0,
        height: 3,
    },
    elevation: 2,
    },

  badge: {
    alignSelf: "center",
    paddingHorizontal: 8,   // was 12
    paddingVertical: 3,      // was 5
    borderRadius: 999,
    },

  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  dpm: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
  },

  value: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F6",
  },

  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  icon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  positiveIcon: {
    backgroundColor: "#EAF8EE",
  },

  negativeIcon: {
    backgroundColor: "#FDECEC",
  },

  iconText: {
    fontWeight: "900",
    fontSize: 11,
  },

  positiveIconText: {
    color: "#2EAF4A",
  },

  negativeIconText: {
    color: "#DC2626",
  },

  reason: {
    flex: 1,
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});