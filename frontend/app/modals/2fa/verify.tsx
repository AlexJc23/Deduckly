import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Set Up 2FA
            </Text>

            <Pressable
              style={styles.closeButton}
              onPress={() => {
                Keyboard.dismiss();
                router.dismissAll();
              }}
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
              <View style={styles.iconContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={30}
                  color="#4A6FE3"
                />
              </View>

              <Text style={styles.eyebrow}>
                STEP 2 OF 2
              </Text>

              <Text style={styles.title}>
                Verify your code
              </Text>

              <Text style={styles.description}>
                Enter the six-digit code from your
                authenticator app to finish setting
                up two-factor authentication.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>
                Authentication Code
              </Text>

              <TextInput
                value={code}
                onChangeText={handleCodeChange}
                maxLength={6}
                placeholder="000000"
                placeholderTextColor="#A0AEC0"
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
                <Text
                  style={[
                    styles.hint,
                    hasError && styles.errorText,
                  ]}
                >
                  {hasError
                    ? "That code isn't correct. Try again."
                    : "Codes expire after a short period."}
                </Text>

                <Text style={styles.counter}>
                  {code.length}/6
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                disabled={
                  code.length !== 6 || isPending
                }
                style={[
                  styles.primaryButton,
                  (code.length !== 6 || isPending) &&
                    styles.primaryButtonDisabled,
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
    paddingTop: 28,
    paddingBottom: 20,
  },

  hero: {
    alignItems: "center",
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#DCE5FF",
    marginBottom: 15,
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

  formCard: {
    marginTop: 28,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 9,
  },

  input: {
    height: 58,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 14,
    backgroundColor: "#F9FAFC",
    paddingHorizontal: 16,
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: 7,
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
    marginTop: 8,
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
    shadowColor: "#4A6FE3",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
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