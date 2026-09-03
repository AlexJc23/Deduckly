import React from "react";
import { BackHeader } from "@/components/ui/BackButton";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

export default function LegalScreen() {
  return (
    <View style={styles.container}>
      <BackHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Legal</Text>

        <Text style={styles.subtitle}>
          Important legal documents and information related to your use of
          Deduckly.
        </Text>

        <Pressable
          style={styles.card}
          onPress={() =>
            router.push("/settings/legal/sections/terms-of-service")
          }
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Terms of Service</Text>

              <Text style={styles.cardDescription}>
                Defines the rules and conditions for using Deduckly.
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() =>
            router.push("/settings/legal/sections/EULA")
          }
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>
                End User License Agreement
              </Text>

              <Text style={styles.cardDescription}>
                The software license governing your use of the app.
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() =>
            router.push(
              "/settings/legal/sections/account-data-deletion"
            )
          }
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>
                Data Deletion Information
              </Text>

              <Text style={styles.cardDescription}>
                Learn how account deletion works and what data is removed.
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() =>
            router.push(
              "/settings/legal/sections/third-party-notice"
            )
          }
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>
                Third-Party Notices
              </Text>

              <Text style={styles.cardDescription}>
                View licenses and acknowledgements for third-party software.
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() =>
            router.push(
              "/settings/privacy/sections/privacy-policy"
            )
          }
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>
                Privacy Policy
              </Text>

              <Text style={styles.cardDescription}>
                Understand how your information is collected, used, and
                protected.
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },

  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  chevron: {
    fontSize: 28,
    color: "#9CA3AF",
    marginLeft: 16,
  },
});