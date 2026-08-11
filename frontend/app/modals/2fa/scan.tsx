import QRCode from "react-native-qrcode-svg";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
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

  const isLoading =
    enable2FAMutation.isPending;

  const hasError =
    enable2FAMutation.isError;

  const secret =
    enable2FAMutation.data?.secret;

  const otpauthUrl =
    enable2FAMutation.data?.otpauth_url;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Set Up 2FA
          </Text>

          <Pressable
            style={styles.closeButton}
            onPress={() => router.dismissAll()}
            hitSlop={8}
          >
            <Ionicons
              name="close"
              size={20}
              color="#64748B"
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>
              STEP 1 OF 2
            </Text>

            <Text style={styles.title}>
              Scan this QR code
            </Text>

            <Text style={styles.description}>
              Open your authenticator app and
              scan the code below to connect it
              to your Deduckly account.
            </Text>
          </View>

          <View style={styles.qrCard}>
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
                <Ionicons
                  name="alert-circle-outline"
                  size={32}
                  color="#DC2626"
                />

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

          {!isLoading && !hasError && secret && (
            <View style={styles.manualSection}>
              <Text style={styles.manualLabel}>
                Can't scan?
              </Text>

              <Text style={styles.manualDescription}>
                Enter this setup key manually in
                your authenticator app.
              </Text>

              <Pressable
                style={styles.secretButton}
                onPress={copySecret}
              >
                <Text
                  style={styles.secret}
                  numberOfLines={1}
                >
                  {secret}
                </Text>

                <Ionicons
                  name="copy-outline"
                  size={18}
                  color="#4A6FE3"
                />
              </Pressable>

              <Text style={styles.copyHint}>
                Tap to copy
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Pressable
              disabled={!secret}
              style={[
                styles.primaryButton,
                !secret &&
                  styles.primaryButtonDisabled,
              ]}
              onPress={() =>
                router.push(
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

  header: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F5",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 20,
  },

  hero: {
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#8A9BB3",
    marginBottom: 6,
  },

  title: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#273449",
    textAlign: "center",
  },

  description: {
    maxWidth: 330,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  qrCard: {
    width: 230,
    height: 230,
    marginTop: 24,
    alignSelf: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#273449",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
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

  errorTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
  },

  retryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A6FE3",
  },

  manualSection: {
    marginTop: 18,
    alignItems: "center",
  },

  manualLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },

  manualDescription: {
    marginTop: 3,
    fontSize: 11,
    color: "#7A899D",
    textAlign: "center",
  },

  secretButton: {
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  secret: {
    flex: 1,
    marginRight: 10,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#334155",
  },

  copyHint: {
    marginTop: 4,
    fontSize: 10,
    color: "#94A3B8",
  },

  actions: {
    marginTop: "auto",
  },

  primaryButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#4A6FE3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  primaryButtonDisabled: {
    opacity: 0.45,
  },

  primaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 14,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#718096",
  },
});