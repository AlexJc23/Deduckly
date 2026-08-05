import { Pressable, StyleSheet, Text, View } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";

type PremiumButtonProps = {
  title: string;
  message: string;
  features?: string[];
  onPress?: () => void;
};

export default function PremiumButton({
  title,
  message,
  features,
  onPress,
}: PremiumButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <FontAwesome6
          name="crown"
          size={35}
          color="#2DBE60"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.message}>
          {message}
        </Text>

        {features && (
          <View style={styles.featuresContainer}>
            {features.map((feature) => (
              <Text
                key={feature}
                style={styles.feature}
              >
                {feature}
              </Text>
            ))}
          </View>
        )}
      </View>

      <AntDesign
        name="right"
        size={20}
        color="#2DBE60"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#2dbe6039",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,

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
    marginRight: 12,
    marginTop: 2,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  message: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },

  featuresContainer: {
    marginTop: 12,
    gap: 6,
  },

  feature: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
});