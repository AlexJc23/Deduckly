import { Pressable, SafeAreaView, Text, View } from "@/theme/components";
import QRCode from "react-native-qrcode-svg";
import { ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@/theme/icons";
import { useEffect } from "react";
import * as Clipboard from "expo-clipboard";

import { useEnable2FA } from "@/features/auth/hooks/use-enable-2fa";

export default function TwoFAScanScreen() {
  const enable2FAMutation = useEnable2FA();

  useEffect(() => {
    if (!enable2FAMutation.data) {
      enable2FAMutation.mutate();
    }
  }, []);

  const copySecret = async () => {
    const secret = enable2FAMutation.data?.secret;

    if (!secret) return;

    await Clipboard.setStringAsync(secret);
  };

  const isLoading = enable2FAMutation.isPending;
  const hasError = enable2FAMutation.isError;
  const secret = enable2FAMutation.data?.secret;
  const otpauthUrl = enable2FAMutation.data?.otpauth_url;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>

            <Text style={styles.eyebrow}>
              STEP 1 OF 2
            </Text>

            <Text style={styles.title}>
              Connect your authenticator
            </Text>

            <Text style={styles.description}>
              Scan the QR code with your authenticator
              app to securely connect it to your
              Deduckly account.
            </Text>
          </View>

          <View style={styles.qrCard}>
            <View style={styles.qrInner}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color="#4A6FE3"
                  />

                  <Text style={styles.loadingText}>
                    Preparing secure setup...
                  </Text>
                </View>
              ) : hasError ? (
                <View style={styles.errorContainer}>
                  <View style={styles.errorIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={26}
                      color="#DC2626"
                    />
                  </View>

                  <Text style={styles.errorTitle}>
                    Unable to start setup
                  </Text>

                  <Text style={styles.errorText}>
                    We couldn't generate your
                    authentication code.
                  </Text>

                  <Pressable
                    style={styles.retryButton}
                    onPress={() =>
                      enable2FAMutation.mutate()
                    }
                  >
                    <Ionicons
                      name="refresh"
                      size={15}
                      color="#4A6FE3"
                    />

                    <Text style={styles.retryText}>
                      Try Again
                    </Text>
                  </Pressable>
                </View>
              ) : otpauthUrl ? (
                <QRCode
                  value={otpauthUrl}
                  size={190}
                  backgroundColor="#FFFFFF"
                  color="#273449"
                />
              ) : null}
            </View>
          </View>

          {!isLoading && !hasError && secret && (
            <View style={styles.manualSection}>
              <View style={styles.manualHeader}>
                <View style={styles.manualIcon}>
                  <Ionicons
                    name="key-outline"
                    size={15}
                    color="#4A6FE3"
                  />
                </View>

                <View style={styles.manualHeaderText}>
                  <Text style={styles.manualLabel}>
                    Can't scan the code?
                  </Text>

                  <Text style={styles.manualDescription}>
                    Enter the setup key manually.
                  </Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.secretButton,
                  pressed && styles.secretButtonPressed,
                ]}
                onPress={copySecret}
              >
                <Text
                  style={styles.secret}
                  numberOfLines={1}
                >
                  {secret}
                </Text>

                <View style={styles.copyIcon}>
                  <Ionicons
                    name="copy-outline"
                    size={17}
                    color="#4A6FE3"
                  />
                </View>
              </Pressable>

              <Text style={styles.copyHint}>
                Tap the key to copy
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Pressable
              disabled={!secret}
              style={({ pressed }) => [
                styles.primaryButton,
                !secret && styles.primaryButtonDisabled,
                pressed &&
                  secret &&
                  styles.primaryButtonPressed,
              ]}
              onPress={() =>
                router.replace(
                  "/modals/2fa/verify"
                )
              }
            >
              <Text style={styles.primaryText}>
                Continue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => router.dismissAll()}
            >
              <Text style={styles.cancelText}>
                Cancel Setup
              </Text>
            </Pressable>
          </View>
        </View>
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
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 14,
  },

  hero: {
    alignItems: "center",
  },

  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A6FE3",
    marginBottom: 10,
    shadowColor: "#4A6FE3",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  stepBadgeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#8A9BB3",
    marginBottom: 5,
  },

  title: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#273449",
    textAlign: "center",
    marginTop: 40,
  },

  description: {
    maxWidth: 350,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  qrCard: {
    width: 242,
    height: 242,
    marginTop: 20,
    alignSelf: "center",
    padding: 10,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7F0",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#273449",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 3,
  },

  qrInner: {
    width: 218,
    height: 218,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },

  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    marginBottom: 10,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
    textAlign: "center",
  },

  errorText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: "#EEF2FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  retryText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4A6FE3",
  },

  manualSection: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },

  manualHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  manualIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    marginRight: 10,
  },

  manualHeaderText: {
    flex: 1,
  },

  manualLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },

  manualDescription: {
    marginTop: 2,
    fontSize: 11,
    color: "#7A899D",
  },

  secretButton: {
    width: "100%",
    marginTop: 10,
    minHeight: 46,
    paddingLeft: 13,
    paddingRight: 8,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E3E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  secretButtonPressed: {
    backgroundColor: "#F1F5F9",
    transform: [{ scale: 0.99 }],
  },

  secret: {
    flex: 1,
    marginRight: 10,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#334155",
  },

  copyIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },

  copyHint: {
    marginTop: 5,
    fontSize: 10,
    color: "#94A3B8",
    textAlign: "center",
  },

  actions: {
    marginTop: "auto",
    paddingTop: 16,
  },

  primaryButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#4A6FE3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,

    shadowColor: "#4A6FE3",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  primaryButtonPressed: {
    backgroundColor: "#3559C7",
    transform: [{ scale: 0.985 }],
  },

  primaryButtonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },

  primaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#718096",
  },
});