import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type PremiumHeaderProps = {
  onExport?: () => void;
};

export default function PremiumHeader({
  onExport,
}: PremiumHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            Reports
          </Text>

          <View style={styles.proBadge}>
            <Text style={styles.proText}>
              PRO
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Powerful insights. Tax-ready reports.
          All in one place.
        </Text>
      </View>

      {/* <Pressable
        onPress={onExport}
        style={({ pressed }) => [
          styles.exportButton,
          pressed &&
            styles.exportButtonPressed,
        ]}
      >
        <Ionicons
          name="download-outline"
          size={16}
          color="#111827"
        />

        <Text style={styles.exportText}>
          Export
        </Text>
      </Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  textContainer: {
    flex: 1,
    paddingRight: 14,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#111827",
  },

  proBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#DCE6FF",
  },

  proText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#4A6FE3",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  exportButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  exportButtonPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.97 }],
  },

  exportText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
});