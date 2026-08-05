import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { router } from "expo-router";
import { BackHeader } from "@/components/ui/BackButton";

export default function SecuritySettingsScreen() {
  const { data: user } = useCurrentUser();

  return (
    <View style={styles.container}>
      <BackHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Security</Text>

        <Text style={styles.subtitle}>
          Manage your password and protect your account with two-factor
          authentication.
        </Text>

        <Pressable
          style={styles.card}
          onPress={() => router.push("/settings/change-password")}
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Change Password</Text>
              <Text style={styles.cardDescription}>
                Update your password to keep your account secure.
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => {
            if (user?.two_fa_enabled) {
              router.push("/modals/2fa/enabled");
            } else {
              router.push("/modals/2fa/start");
            }
          }}
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>
                Two-Factor Authentication
              </Text>

              <Text style={styles.cardDescription}>
                {user?.two_fa_enabled
                  ? "Enabled for your account."
                  : "Add an extra layer of protection."}
              </Text>
            </View>

            <View style={styles.rightSide}>
              <View
                style={[
                  styles.badge,
                  user?.two_fa_enabled
                    ? styles.badgeEnabled
                    : styles.badgeDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    user?.two_fa_enabled
                      ? styles.badgeEnabledText
                      : styles.badgeDisabledText,
                  ]}
                >
                  {user?.two_fa_enabled ? "Enabled" : "Disabled"}
                </Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Keep your account secure
          </Text>

          <Text style={styles.infoText}>
            We recommend using a strong, unique password and enabling
            two-factor authentication to help prevent unauthorized access to
            your account.
          </Text>
        </View>
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
    backgroundColor: "#FFF",
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

  rightSide: {
    alignItems: "center",
    marginLeft: 16,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 8,
  },

  badgeEnabled: {
    backgroundColor: "#DCFCE7",
  },

  badgeDisabled: {
    backgroundColor: "#F3F4F6",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  badgeEnabledText: {
    color: "#15803D",
  },

  badgeDisabledText: {
    color: "#6B7280",
  },

  chevron: {
    fontSize: 28,
    color: "#9CA3AF",
  },

  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    marginTop: 8,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  infoText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
  },
});