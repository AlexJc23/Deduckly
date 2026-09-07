import { Pressable, SafeAreaView, Text, TextInput, View } from "@/theme/components";
import { ActivityIndicator, Keyboard, StyleSheet } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@/theme/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { verify2FA } from "@/features/auth/api/auth.api";

export default function TwoFAVerifyScreen() {
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  const verify2FAMutation = useMutation({
    mutationFn: verify2FA,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });

      router.replace("/modals/2fa/enabled");
    },

    onError: () => {
      // Error is displayed inline below the input.
    },
  });

  const handleCodeChange = (value: string) => {
    const cleanedCode = value
      .replace(/[^0-9]/g, "")
      .slice(0, 6);

    setCode(cleanedCode);

    if (verify2FAMutation.isError) {
      verify2FAMutation.reset();
    }
  };

  const handleVerify = () => {
    const trimmedCode = code.trim();

    if (trimmedCode.length !== 6) {
      return;
    }

    Keyboard.dismiss();

    verify2FAMutation.mutate(trimmedCode);
  };

  const hasError = verify2FAMutation.isError;
  const isPending = verify2FAMutation.isPending;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          style={styles.flex}
          onPress={Keyboard.dismiss}
        >
          <View style={styles.content}>
            <View style={styles.hero}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>
                  2
                </Text>
              </View>

              <Text style={styles.eyebrow}>
                STEP 2 OF 2
              </Text>

              <View style={styles.iconContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={32}
                  color="#4A6FE3"
                />
              </View>

              <Text style={styles.title}>
                Verify your code
              </Text>

              <Text style={styles.description}>
                Enter the six-digit code from your
                authenticator app to finish securing
                your Deduckly account.
              </Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Authentication Code
                </Text>

                <View style={styles.secureBadge}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={11}
                    color="#64748B"
                  />

                  <Text style={styles.secureText}>
                    Secure
                  </Text>
                </View>
              </View>

              <TextInput
                value={code}
                onChangeText={handleCodeChange}
                maxLength={6}
                placeholder="000000"
                placeholderTextColor="#B8C1CE"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                autoFocus
                editable={!isPending}
                style={[
                  styles.input,
                  hasError && styles.inputError,
                ]}
              />

              <View style={styles.codeHintRow}>
                <View style={styles.hintContainer}>
                  <Ionicons
                    name={
                      hasError
                        ? "alert-circle-outline"
                        : "time-outline"
                    }
                    size={13}
                    color={
                      hasError
                        ? "#DC2626"
                        : "#94A3B8"
                    }
                  />

                  <Text
                    style={[
                      styles.hint,
                      hasError && styles.errorText,
                    ]}
                  >
                    {hasError
                      ? "That code isn't correct. Try again."
                      : "Your code changes periodically."}
                  </Text>
                </View>

                <Text style={styles.counter}>
                  {code.length}/6
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color="#4A6FE3"
                />
              </View>

              <Text style={styles.infoText}>
                Keep your authenticator app available.
                You'll use it each time you sign in.
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                disabled={
                  code.length !== 6 || isPending
                }
                style={({ pressed }) => [
                  styles.primaryButton,
                  (code.length !== 6 || isPending) &&
                    styles.primaryButtonDisabled,
                  pressed &&
                    code.length === 6 &&
                    !isPending &&
                    styles.primaryButtonPressed,
                ]}
                onPress={handleVerify}
              >
                {isPending ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text style={styles.primaryText}>
                      Verifying...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.primaryText}>
                      Verify & Enable
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  Keyboard.dismiss();
                  router.dismissAll();
                }}
                disabled={isPending}
              >
                <Text style={styles.cancelText}>
                  Cancel Setup
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
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

  flex: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 18,
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
    marginBottom: 9,
    shadowColor: "#4A6FE3",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  stepBadgeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#8A9BB3",
    marginBottom: 13,
  },

  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#DCE5FF",
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: "#273449",
    textAlign: "center",
  },

  description: {
    maxWidth: 360,
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
  },

  formCard: {
    marginTop: 30,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",
    shadowColor: "#273449",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
  },

  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },

  secureText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },

  input: {
    height: 62,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 15,
    backgroundColor: "#F9FAFC",
    paddingHorizontal: 16,
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: 8,
    color: "#273449",
    textAlign: "center",
  },

  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },

  codeHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9,
  },

  hintContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  hint: {
    flex: 1,
    fontSize: 11,
    color: "#94A3B8",
  },

  errorText: {
    color: "#DC2626",
  },

  counter: {
    marginLeft: 10,
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },

  infoCard: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F1F5FF",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5EBFF",
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },

  actions: {
    marginTop: "auto",
  },

  primaryButton: {
    height: 54,
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
    paddingVertical: 14,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#718096",
  },
});