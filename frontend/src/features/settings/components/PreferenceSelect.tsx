import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PreferenceSelectProps = {
  label: string;
  value: string;
  onPress: () => void;
  description?: string;
};

export function PreferenceSelect({
  label,
  value,
  onPress,
  description,
}: PreferenceSelectProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      {description && (
        <Text style={styles.description}>
          {description}
        </Text>
      )}

      <Pressable
        style={styles.button}
        onPress={onPress}
      >
        <Text style={styles.value}>
          {value}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },

  description: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },

  button: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 16,
  },

  value: {
    fontSize: 16,
    color: "#111827",
  },
});