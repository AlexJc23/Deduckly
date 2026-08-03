import { BackHeader } from "@/components/ui/BackButton";
import { View, Text, Pressable, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";

import DeleteAccountModal from "@/features/settings/modals/DeleteAccountModal";
import { clearTokens } from "@/features/auth/services/auth-service.service";
import { useDeleteUser } from "@/features/auth/hooks/use-delete-account";

export default function PrivacyScreen() {
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <View style={styles.container}>
      <BackHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Privacy & Security</Text>

        <Text style={styles.subtitle}>
          Manage your privacy settings and learn how Deduckly protects your
          information.
        </Text>

        <Pressable
          style={styles.card}
          onPress={() =>
            router.push("/settings/privacy/sections/privacy-policy")
          }
        >
          <View style={styles.cardContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Privacy Policy</Text>

              <Text style={styles.cardDescription}>
                Read how we collect, use, and protect your personal information.
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.deleteCard}
          onPress={() => setShowDeleteModal(true)}
        >
          <View style={styles.cardContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deleteTitle}>Delete Account</Text>

              <Text style={styles.deleteDescription}>
                Permanently remove your account and all associated data.
              </Text>
            </View>

            <Text style={styles.deleteChevron}>›</Text>
          </View>
        </Pressable>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Your privacy matters
          </Text>

          <Text style={styles.infoText}>
            We're committed to protecting your information. Your data is
            encrypted where appropriate, used only to provide Deduckly's
            services, and is never sold to third parties.
          </Text>
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={async () => {
          await deleteUserMutation.mutateAsync();

          await clearTokens();

          queryClient.clear();

          router.replace("/login");
        }}
      />
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

  deleteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FECACA",

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

  deleteTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 6,
  },

  deleteDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  chevron: {
    fontSize: 28,
    color: "#9CA3AF",
    marginLeft: 16,
  },

  deleteChevron: {
    fontSize: 28,
    color: "#DC2626",
    marginLeft: 16,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,

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