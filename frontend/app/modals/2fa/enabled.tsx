import { useLanguage, Translated } from "@/i18n/language";
import { Text, Pressable, View } from "@/theme/components";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@/theme/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { disable2FA } from "@/features/auth/api/auth.api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export default function TwoFAEnabledScreen() {
  useLanguage();
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

      router.dismiss();
    },
  });

  const handleDisable = () => {
    disableMutation.mutate();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <View style={styles.iconInner}>
              <Ionicons
                name="shield-checkmark"
                size={30}
                color="#4A6FE3"
              />
            </View>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.status}>
              <Translated text={"Protection enabled"} /></Text>
          </View>

          <Text style={styles.title}>
            <Translated text={"Two-Factor Authentication"} /></Text>

          <Text style={styles.description}>
            <Translated text={"Your account has an additional layer of security enabled. You'll need your authenticator code when signing in."} /></Text>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <Ionicons
              name="person-outline"
              size={18}
              color="#4A6FE3"
            />
          </View>

          <View style={styles.accountContent}>
            <Text style={styles.cardLabel}>
              <Translated text={"PROTECTED ACCOUNT"} /></Text>

            <Text
              style={styles.email}
              numberOfLines={1}
            >
              {user?.email ?? "Your account"}
            </Text>
          </View>

          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#22C55E"
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#4A6FE3"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              <Translated text={"Your account is protected"} /></Text>

            <Text style={styles.infoText}>
              <Translated text={"Two-factor authentication helps keep your account secure even if your password is compromised."} /></Text>
          </View>
        </View>

        <View style={styles.securitySection}>
          <Text style={styles.sectionLabel}>
            <Translated text={"SECURITY SETTINGS"} /></Text>

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
            <View style={styles.disableIcon}>
              <Ionicons
                name="shield-outline"
                size={18}
                color="#DC2626"
              />
            </View>

            <View style={styles.disableContent}>
              <Text style={styles.disableText}>
                <Translated text={"Disable 2FA"} /></Text>

              <Text style={styles.disableSubtext}>
                <Translated text={"Remove two-factor authentication"} /></Text>
            </View>

            {disableMutation.isPending ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#94A3B8"
              />
            )}
          </Pressable>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.dismiss()
          }
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color="#64748B"
          />

          <Text style={styles.backText}>
            <Translated text={"Back to Security"} /></Text>
        </Pressable>
      </View>

      {showConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="shield-outline"
                size={25}
                color="#DC2626"
              />
            </View>

            <Text style={styles.modalTitle}>
              <Translated text={"Disable 2FA?"} /></Text>

            <Text style={styles.modalText}>
              <Translated text={"Your account will no longer require two-factor authentication when signing in."} /></Text>

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
                  <Translated text={"Cancel"} /></Text>
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
                  <Text style={styles.confirmText}>
                    <Translated text={"Disable"} /></Text>
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
    backgroundColor: "#F7F9FC",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 24,
  },

  hero: {
    alignItems: "center",
  },

  iconContainer: {
    width: 78,
    height: 78,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#DCE5FF",
    marginBottom: 14,
  },

  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#4A6FE3",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 10,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  status: {
    fontSize: 11,
    fontWeight: "800",
    color: "#15803D",
  },

  title: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
    color: "#273449",
    textAlign: "center",
    letterSpacing: -0.6,
    marginTop: 20,
  },

  description: {
    maxWidth: 340,
    marginTop: 9,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  accountCard: {
    width: "100%",
    marginTop: 26,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    marginRight: 12,
  },

  accountContent: {
    flex: 1,
  },

  cardLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#94A3B8",
    marginBottom: 4,
  },

  email: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  infoCard: {
    width: "100%",
    marginTop: 12,
    padding: 16,
    borderRadius: 17,
    backgroundColor: "#F1F5FF",
    borderWidth: 1,
    borderColor: "#DCE5FF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 4,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  securitySection: {
    width: "100%",
    marginTop: 24,
  },

  sectionLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#94A3B8",
    marginBottom: 8,
  },

  disableButton: {
    width: "100%",
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  disableIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    marginRight: 12,
  },

  disableContent: {
    flex: 1,
  },

  disableText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },

  disableSubtext: {
    marginTop: 3,
    fontSize: 11,
    color: "#94A3B8",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: "auto",
    paddingVertical: 14,
  },

  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  modal: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderWidth: 1,
    borderColor: "#E3E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },

  modalIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    marginBottom: 14,
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
    marginTop: 24,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
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
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
  },

  confirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});