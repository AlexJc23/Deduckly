import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type QuickActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function QuickActionButton({
  icon,
  title,
  subtitle,
  onPress,
}: QuickActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
    >
      <Ionicons
        name={icon}
        size={24}
        color="#7AC943"
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 90,
    borderRadius: 16,
    backgroundColor: "#102420",
    borderWidth: 1,
    borderColor: "#1F3A33",
    padding: 16,
    justifyContent: "space-between",
  },

  textContainer: {
    marginTop: 12,
  },

  title: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },

  subtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
});