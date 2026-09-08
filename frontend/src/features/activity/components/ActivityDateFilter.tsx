import { useLanguage, Translated } from "@/i18n/language";
import { Pressable, Text } from "@/theme/components";
import { StyleSheet } from "react-native";
import { Ionicons } from "@/theme/icons";

type Props = {
  label: string;
  onPress: () => void;
};

export function ActivityDateFilter({
  label,
  onPress,
}: Props) {
  useLanguage();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <Ionicons
        name="calendar-outline"
        size={16}
        color="#64748B"
      />

      <Text style={styles.text}>
        {<Translated text={label} />}
      </Text>

      <Ionicons
        name="chevron-down"
        size={14}
        color="#94A3B8"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 7,
  },

  buttonPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.98 }],
  },

  text: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 13,
  },
});