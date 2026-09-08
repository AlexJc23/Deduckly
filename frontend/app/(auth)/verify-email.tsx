import { useLanguage, Translated } from "@/i18n/language";
import { Pressable, SafeAreaView, Text, View } from "@/theme/components";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@/theme/icons";

import Logo from "../../assets/images/logo.svg";

import {
  resendVerification,
  verifyEmail,
} from "@/features/auth/api/auth.api";

export default function VerifyEmail() {
  useLanguage();
  const { token, email } = useLocalSearchParams<{
    token?: string;
    email?: string;
  }>();

  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmail,

    onSuccess: () => {
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: resendVerification,
  });

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token);
    }
  }, [token]);

  const isLoading = verifyEmailMutation.isPending;
  const isSuccess = verifyEmailMutation.isSuccess;
  const isError = verifyEmailMutation.isError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.brand}>
            <View style={styles.logoContainer}>
              <Logo
                width={58}
                height={58}
                color="#0072B5"
              />
            </View>
          </View>

          {!token && (
            <View style={styles.stateContainer}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="mail-outline"
                  size={28}
                  color="#0072B5"
                />
              </View>

              <Text style={styles.eyebrow}>
                <Translated text={"VERIFY YOUR EMAIL"} /></Text>

              <Text style={styles.title}>
                <Translated text={"Check your inbox"} /></Text>

              <Text style={styles.subtitle}>
                <Translated text={"We sent a verification link to"} /></Text>

              <View style={styles.emailPill}>
                <Ionicons
                  name="mail-outline"
                  size={15}
                  color="#0072B5"
                />

                <Text
                  style={styles.emailText}
                  numberOfLines={1}
                >
                  {email || "your email address"}
                </Text>
              </View>

              <Text style={styles.helperText}>
                <Translated text={"Tap the link in the email to verify your account and finish setting things up."} /></Text>

              {email && (
                <Pressable
                  disabled={
                    resendVerificationMutation.isPending
                  }
                  style={({ pressed }) => [
                    styles.button,
                    pressed &&
                      styles.buttonPressed,
                    resendVerificationMutation.isPending &&
                      styles.buttonDisabled,
                  ]}
                  onPress={() =>
                    resendVerificationMutation.mutate(
                      email
                    )
                  }
                >
                  {resendVerificationMutation.isPending ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="refresh-outline"
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text style={styles.buttonText}>
                        <Translated text={"Resend Verification Email"} /></Text>
                    </>
                  )}
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed &&
                    styles.secondaryButtonPressed,
                ]}
                onPress={() =>
                  router.replace("/(auth)/login")
                }
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color="#64748B"
                />

                <Text
                  style={styles.secondaryButtonText}
                >
                  <Translated text={"Back to Login"} /></Text>
              </Pressable>
            </View>
          )}

          {isLoading && (
            <View style={styles.stateContainer}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={29}
                  color="#0072B5"
                />
              </View>

              <Text style={styles.eyebrow}>
                <Translated text={"EMAIL VERIFICATION"} /></Text>

              <Text style={styles.title}>
                <Translated text={"Verifying your email"} /></Text>

              <Text style={styles.subtitle}>
                <Translated text={"Please wait while we securely verify your email address."} /></Text>

              <View style={styles.loadingCard}>
                <ActivityIndicator
                  size="small"
                  color="#0072B5"
                />

                <Text style={styles.loadingText}>
                  <Translated text={"Verifying account..."} /></Text>
              </View>
            </View>
          )}

          {isSuccess && (
            <View style={styles.stateContainer}>
              <View
                style={[
                  styles.iconCircle,
                  styles.successCircle,
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={30}
                  color="#16A34A"
                />
              </View>

              <Text style={styles.eyebrow}>
                <Translated text={"EMAIL VERIFIED"} /></Text>

              <Text style={styles.title}>
                <Translated text={"You're all set"} /></Text>

              <Text style={styles.subtitle}>
                <Translated text={"Your email has been successfully verified."} /></Text>

              <View style={styles.successCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#16A34A"
                />

                <Text style={styles.successText}>
                  <Translated text={"Taking you to login..."} /></Text>
              </View>
            </View>
          )}

          {isError && (
            <View style={styles.stateContainer}>
              <View
                style={[
                  styles.iconCircle,
                  styles.errorCircle,
                ]}
              >
                <Ionicons
                  name="alert-outline"
                  size={30}
                  color="#DC2626"
                />
              </View>

              <Text style={styles.eyebrow}>
                <Translated text={"VERIFICATION FAILED"} /></Text>

              <Text style={styles.title}>
                <Translated text={"Link is invalid or expired"} /></Text>

              <Text style={styles.subtitle}>
                <Translated text={"This verification link is no longer valid. Please request a new one."} /></Text>

              {email && (
                <Pressable
                  disabled={
                    resendVerificationMutation.isPending
                  }
                  style={({ pressed }) => [
                    styles.button,
                    pressed &&
                      styles.buttonPressed,
                    resendVerificationMutation.isPending &&
                      styles.buttonDisabled,
                  ]}
                  onPress={() =>
                    resendVerificationMutation.mutate(
                      email
                    )
                  }
                >
                  {resendVerificationMutation.isPending ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="refresh-outline"
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text style={styles.buttonText}>
                        <Translated text={"Resend Verification Email"} /></Text>
                    </>
                  )}
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed &&
                    styles.secondaryButtonPressed,
                ]}
                onPress={() =>
                  router.replace("/(auth)/login")
                }
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color="#64748B"
                />

                <Text
                  style={styles.secondaryButtonText}
                >
                  <Translated text={"Back to Login"} /></Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.security}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#64748B"
            />
          </View>

          <Text style={styles.securityText}>
            <Translated text={"Your information is securely encrypted."} /></Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    marginBottom: 34,
  },

  logoContainer: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",


    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 3,
  },

  stateContainer: {
    width: "100%",
    maxWidth: 430,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 26,

    borderWidth: 1,
    borderColor: "#E5EAF0",

    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 3,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EAF4FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  successCircle: {
    backgroundColor: "#DCFCE7",
  },

  errorCircle: {
    backgroundColor: "#FEE2E2",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.35,
    color: "#64748B",
    marginBottom: 7,
  },

  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: "#273449",
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 340,
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  emailPill: {
    maxWidth: "100%",
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: "#F0F7FC",
    borderWidth: 1,
    borderColor: "#D7EAF6",
  },

  emailText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#0072B5",
  },

  helperText: {
    maxWidth: 330,
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    color: "#94A3B8",
    textAlign: "center",
  },

  button: {
    width: "100%",
    height: 54,
    marginTop: 25,
    borderRadius: 15,
    backgroundColor: "#0072B5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,

    shadowColor: "#0072B5",
    shadowOpacity: 0.18,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  buttonPressed: {
    backgroundColor: "#005F96",
    transform: [{ scale: 0.985 }],
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  secondaryButton: {
    minHeight: 46,
    marginTop: 8,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
  },

  secondaryButtonPressed: {
    backgroundColor: "#F1F5F9",
  },

  secondaryButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },

  loadingCard: {
    width: "100%",
    minHeight: 52,
    marginTop: 24,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  loadingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  successCard: {
    width: "100%",
    minHeight: 52,
    marginTop: 24,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  successText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803D",
  },

  security: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingTop: 20,
  },

  securityIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#E9EEF4",
    alignItems: "center",
    justifyContent: "center",
  },

  securityText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
});