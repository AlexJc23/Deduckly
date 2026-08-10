import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import { BackHeader } from "@/components/ui/BackButton";
import DeleteAccountModal from "@/features/settings/modals/DeleteAccountModal";
import { clearTokens } from "@/features/auth/services/auth-service.service";
import { useDeleteUser } from "@/features/auth/hooks/use-delete-account";

export default function PrivacyScreen() {
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const handleDeleteAccount = async () => {
    await deleteUserMutation.mutateAsync();

    await clearTokens();

    queryClient.clear();

    router.replace("/login");
  };

  return (
    <View style={styles.screen}>
        <BackHeader />
      <SafeAreaView style={styles.safeArea}>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}

          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              PRIVACY & SECURITY
            </Text>

            <Text style={styles.title}>
              Your privacy
            </Text>

            <Text style={styles.subtitle}>
              Manage your privacy settings and learn
              how Deduckly protects your information.
            </Text>
          </View>

          {/* Privacy Policy */}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              PRIVACY
            </Text>

            <Pressable
              style={styles.card}
              onPress={() =>
                router.push(
                  "/settings/privacy/sections/privacy-policy"
                )
              }
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>
                  ◇
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  Privacy Policy
                </Text>

                <Text style={styles.cardDescription}>
                  Learn how we collect, use, and
                  protect your personal information.
                </Text>
              </View>

              <Text style={styles.chevron}>
                ›
              </Text>
            </Pressable>
          </View>

          {/* Privacy Information */}

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>
                  ✓
                </Text>
              </View>

              <View style={styles.infoHeaderText}>
                <Text style={styles.infoTitle}>
                  Your privacy matters
                </Text>

                <Text style={styles.infoEyebrow}>
                  DATA PROTECTION
                </Text>
              </View>
            </View>

            <Text style={styles.infoText}>
              We're committed to protecting your
              information. Your data is encrypted
              where appropriate, used only to provide
              Deduckly's services, and is never sold
              to third parties.
            </Text>
          </View>

          {/* Danger Zone */}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              DANGER ZONE
            </Text>

            <Pressable
              style={styles.deleteCard}
              onPress={() =>
                setShowDeleteModal(true)
              }
            >
              <View style={styles.deleteIcon}>
                <Text style={styles.deleteIconText}>
                  !
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.deleteTitle}>
                  Delete Account
                </Text>

                <Text style={styles.deleteDescription}>
                  Permanently remove your account and
                  all associated data.
                </Text>
              </View>

              <Text style={styles.deleteChevron}>
                ›
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <DeleteAccountModal
          visible={showDeleteModal}
          onClose={() =>
            setShowDeleteModal(false)
          }
          onDelete={handleDeleteAccount}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 24,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#94A3B8",
    marginBottom: 4,
  },

  title: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#273449",
  },

  subtitle: {
    maxWidth: 350,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  section: {
    marginBottom: 20,
  },

  sectionLabel: {
    marginLeft: 2,
    marginBottom: 8,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#94A3B8",
  },

  card: {
    minHeight: 92,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E1E7EF",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF4FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0072B5",
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#273449",
  },

  cardDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },

  chevron: {
    marginLeft: 10,
    fontSize: 25,
    lineHeight: 25,
    color: "#A0AEC0",
  },

  infoCard: {
    marginBottom: 24,
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D8E8F1",
    backgroundColor: "#F4FAFD",
  },

  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#DCEEF7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoIconText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0072B5",
  },

  infoHeaderText: {
    flex: 1,
  },

  infoEyebrow: {
    marginTop: 2,
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#8BA7B7",
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#273449",
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#526579",
  },

  deleteCard: {
    minHeight: 92,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0D2D2",
    backgroundColor: "#FFF9F9",
    flexDirection: "row",
    alignItems: "center",
  },

  deleteIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  deleteIconText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#DC2626",
  },

  deleteTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#991B1B",
  },

  deleteDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#7F6A6A",
  },

  deleteChevron: {
    marginLeft: 10,
    fontSize: 25,
    lineHeight: 25,
    color: "#DC2626",
  },
});