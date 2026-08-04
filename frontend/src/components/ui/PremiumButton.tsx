import { Pressable, StyleSheet, Text, View } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";

type PremiumButtonProps = {
  message: string;
  title: string;
};

export default function PremiumButton({
  message,
  title,
}: PremiumButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      // onPress={() => {}} replace with actual onPress handler when needed
    >
      <View style={styles.iconContainer}>
        <FontAwesome6 name="crown" size={35} color="#2DBE60" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      <AntDesign name="right" size={20} color="#2DBE60" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2dbe6039",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,

    borderWidth: 2,
    borderColor: "#2DBE60",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  message: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginRight: 6,
  },
});