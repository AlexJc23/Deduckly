import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";

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
      onPress={() => router.push("/screens/paywall")}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="sparkles-outline"
          size={21}
          color="#4A6FE3"
        />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>
              PRO
            </Text>
          </View>
        </View>

        <Text style={styles.message}>
          {message}
        </Text>

        {features && (
          <View style={styles.featuresContainer}>
            {features.map((feature) => (
              <View
                key={feature}
                style={styles.featureRow}
              >
                <View style={styles.featureIcon}>
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color="#4A6FE3"
                  />
                </View>

                <Text style={styles.feature}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.chevronContainer}>
        <AntDesign
          name="right"
          size={15}
          color="#4A6FE3"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#C9D6FF",

    shadowColor: "#111827",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  buttonPressed: {
    backgroundColor: "#F8FAFC",
    borderColor: "#4A6FE3",
    transform: [{ scale: 0.985 }],
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
    paddingRight: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.2,
  },

  proBadge: {
    backgroundColor: "#4A6FE3",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  message: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  featuresContainer: {
    marginTop: 12,
    gap: 7,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  featureIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  feature: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#334155",
    fontWeight: "600",
  },

  chevronContainer: {
    width: 28,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
});