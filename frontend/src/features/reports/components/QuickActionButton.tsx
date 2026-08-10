import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={18}
            color="#4A6FE3"
          />
        </View>

      </View>

      <View style={styles.textContainer}>
        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          style={styles.subtitle}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 88,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E7EBF1",
    padding: 13,
    shadowColor: "#0F172A",
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  pressed: {
    backgroundColor: "#F8FAFC",
    borderColor: "#DCE3EE",
    transform: [{ scale: 0.985 }],
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  arrowContainer: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    marginTop: 11,
  },

  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#273449",
    letterSpacing: -0.15,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
  },
});