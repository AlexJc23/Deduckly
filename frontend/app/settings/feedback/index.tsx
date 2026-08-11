import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { BackHeader } from "@/components/ui/BackButton";

export default function FeedbackScreen() {
  function openFeedback(
    type: "bug" | "feature" | "general",
  ) {
    router.push({
      pathname: "/settings/feedback/form",
      params: { type },
    });
  }
    // add profanity feature to feedback form
  return (
    <View style={styles.screen}>
      <BackHeader />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Help & Feedback
        </Text>

        <Text style={styles.subtitle}>
          Help improve Deduckly by reporting bugs,
          requesting features, or sharing your
          thoughts.
        </Text>

        <Pressable
          style={styles.card}
          onPress={() => openFeedback("bug")}
        >
          <Text style={styles.emoji}>
            <Ionicons
            name="bug-outline"
            size={30}
            color="#EF4444"
            />
          </Text>

          <View style={styles.text}>
            <Text style={styles.cardTitle}>
              Report a Bug
            </Text>

            <Text style={styles.cardSubtitle}>
              Something isn't working correctly.
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => openFeedback("feature")}
        >
          <Text style={styles.emoji}>
            <Ionicons
            name="bulb-outline"
            size={30}
            color="#0d0d0c"
            />
          </Text>

          <View style={styles.text}>
            <Text style={styles.cardTitle}>
              Request a Feature
            </Text>

            <Text style={styles.cardSubtitle}>
              Tell us what you'd love to see next.
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => openFeedback("general")}
        >
          <Text style={styles.emoji}>
            <Text style={styles.emoji}>
            <Ionicons
            name="heart-outline"
            size={30}
            color="#4744ef"
            />
          </Text>
          </Text>

          <View style={styles.text}>
            <Text style={styles.cardTitle}>
              General Feedback
            </Text>

            <Text style={styles.cardSubtitle}>
              Share your thoughts about Deduckly.
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginTop: 10,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 28,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  emoji: {
    fontSize: 30,
    marginRight: 16,
  },

  text: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
});