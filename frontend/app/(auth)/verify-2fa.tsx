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
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import { useAuth } from "@/features/auth/context/auth.context";
import { verify2FA } from "@/features/auth/api/auth.api";
import { saveTokens } from "@/features/auth/services/auth-service.service";
import { clearTemporaryToken } from "@/features/auth/services/twofa-storage.service";

export default function Verify2FAScreen() {
  const [code, setCode] = useState("");

  const { signIn } = useAuth();

  const verify2FAMutation = useMutation({
    mutationFn: verify2FA,

    onSuccess: async (data) => {
      await saveTokens(
        data.access_token,
        data.refresh_token,
      );

      await clearTemporaryToken();

      signIn();

      router.replace("/(tabs)/dashboard");
    },
  });

  const handleVerify = () => {
    Keyboard.dismiss();

    if (code.length !== 6) {
      return;
    }

    verify2FAMutation.mutate(code);
  };

  const isDisabled =
    code.length !== 6 ||
    verify2FAMutation.isPending;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          style={styles.flex}
          onPress={Keyboard.dismiss}
        >
          <View style={styles.container}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>
                ✓
              </Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.eyebrow}>
                ACCOUNT SECURITY
              </Text>

              <Text style={styles.title}>
                Verify your identity
              </Text>

              <Text style={styles.subtitle}>
                Enter the six-digit code from your
                authenticator app to continue.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>
                AUTHENTICATION CODE
              </Text>

              <TextInput
                value={code}
                onChangeText={(value) =>
                  setCode(
                    value
                      .replace(/\D/g, "")
                      .slice(0, 6),
                  )
                }
                maxLength={6}
                placeholder="000000"
                placeholderTextColor="#B4BEC9"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                returnKeyType="done"
                onSubmitEditing={handleVerify}
                style={styles.codeInput}
              />

              <Text style={styles.helperText}>
                Open your authenticator app to find
                your current verification code.
              </Text>

              {verify2FAMutation.isError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>
                    !
                  </Text>

                  <Text style={styles.errorText}>
                    That code isn't correct. Check
                    your authenticator app and try
                    again.
                  </Text>
                </View>
              )}

              <Pressable
                disabled={isDisabled}
                onPress={handleVerify}
                style={[
                  styles.verifyButton,
                  isDisabled &&
                    styles.verifyButtonDisabled,
                ]}
              >
                {verify2FAMutation.isPending ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text style={styles.buttonText}>
                      Verifying...
                    </Text>
                  </>
                ) : (
                  <Text style={styles.buttonText}>
                    Verify & Continue
                  </Text>
                )}
              </Pressable>
            </View>

            <View style={styles.security}>
              <View style={styles.securityIcon}>
                <Text style={styles.securityCheck}>
                  ✓
                </Text>
              </View>

              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>
                  Your account is protected
                </Text>

                <Text style={styles.securityText}>
                  Two-factor authentication helps keep
                  your Deduckly account secure.
                </Text>
              </View>
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

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 24,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EAF4FA",
    borderWidth: 1,
    borderColor: "#D3E8F3",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  icon: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0072B5",
  },

  header: {
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#94A3B8",
    marginBottom: 6,
  },

  title: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#273449",
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 330,
    marginTop: 9,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
  },

  form: {
    marginTop: 34,
  },

  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#64748B",
    marginBottom: 9,
    textAlign: "center",
  },

  codeInput: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9E2EA",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: 8,
    color: "#273449",
    textAlign: "center",
  },

  helperText: {
    marginTop: 9,
    paddingHorizontal: 10,
    fontSize: 11,
    lineHeight: 16,
    color: "#94A3B8",
    textAlign: "center",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorIcon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 19,
    marginRight: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#B91C1C",
  },

  verifyButton: {
    height: 54,
    marginTop: 22,
    borderRadius: 15,
    backgroundColor: "#0072B5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,

    shadowColor: "#0072B5",
    shadowOpacity: 0.16,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  verifyButtonDisabled: {
    opacity: 0.45,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  security: {
    marginTop: "auto",
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E1E7EF",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  securityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EAF4FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  securityCheck: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0072B5",
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  securityText: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    color: "#94A3B8",
  },
});