import {
  ActivityIndicator,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { disable2FA } from "@/features/auth/api/auth.api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { BackHeader } from "@/components/ui/BackButton";

export default function TwoFAEnabledScreen() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  const [showConfirm, setShowConfirm] =
    useState(false);

  const disableMutation = useMutation({
    mutationFn: disable2FA,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });

      router.replace("/settings/security");
    },
  });

  const handleDisable = () => {
    disableMutation.mutate();
  };

  return (
    <View style={styles.screen}>
      <BackHeader />

      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={styles.title}>
          Two-Factor Authentication
        </Text>

        <Text style={styles.status}>
          Enabled
        </Text>

        <Text style={styles.description}>
          Your account has an additional layer
          of security enabled.
        </Text>

        <View style={styles.accountCard}>
          <Text style={styles.cardLabel}>
            PROTECTED ACCOUNT
          </Text>

          <Text
            style={styles.email}
            numberOfLines={1}
          >
            {user?.email ?? "Your account"}
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>
            Disable two-factor authentication?
          </Text>

          <Text style={styles.warningText}>
            This will remove the additional
            security step from your account.
          </Text>
        </View>

        <Pressable
          style={[
            styles.disableButton,
            disableMutation.isPending &&
              styles.disabledButton,
          ]}
          disabled={disableMutation.isPending}
          onPress={() =>
            setShowConfirm(true)
          }
        >
          {disableMutation.isPending ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text style={styles.disableText}>
              Disable 2FA
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.push(
              "/settings/security",
            )
          }
        >
          <Text style={styles.backText}>
            Back to Security
          </Text>
        </Pressable>
      </View>

      {/* Confirmation Modal */}

      {showConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Disable 2FA?
            </Text>

            <Text style={styles.modalText}>
              Your account will no longer
              require two-factor authentication
              when signing in.
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() =>
                  setShowConfirm(false)
                }
                disabled={
                  disableMutation.isPending
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={() => {
                  setShowConfirm(false);
                  handleDisable();
                }}
                disabled={
                  disableMutation.isPending
                }
              >
                {disableMutation.isPending ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={styles.confirmText}
                  >
                    Disable
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: "center",
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#DDE5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  icon: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4A6FE3",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#273449",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  status: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#4A6FE3",
  },

  description: {
    maxWidth: 310,
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
  },

  accountCard: {
    width: "100%",
    marginTop: 28,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },

  cardLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#94A3B8",
    marginBottom: 6,
  },

  email: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },

  warningCard: {
    width: "100%",
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9A3412",
    marginBottom: 4,
  },

  warningText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#C2410C",
  },

  disableButton: {
    width: "100%",
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  disabledButton: {
    opacity: 0.6,
  },

  disableText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
  },

  backButton: {
    width: "100%",
    marginTop: 10,
    paddingVertical: 15,
    alignItems: "center",
  },

  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  modal: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#273449",
    textAlign: "center",
  },

  modalText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
    backgroundColor: "#F1F4F8",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
  },

  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});