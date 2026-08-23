import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import Logo from "../../assets/images/logo.svg";

import {
  resendVerification,
  verifyEmail,
} from "@/features/auth/api/auth.api";

import { useIsTablet } from "@/hooks/use-is-tablet";

export default function VerifyEmail() {
  const { token, email } = useLocalSearchParams<{
    token?: string;
    email?: string;
  }>();

  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

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
            <View
  style={[
    styles.logoContainer,
    {
      width: isTablet ? 92 : 76,
      height: isTablet ? 92 : 76,
    },
  ]}
>
  <Logo
    width="100%"
    height="100%"
    color="#377ca4"
  />
</View>
          </View>

          {!token && (
            <View style={styles.stateContainer}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="mail-outline"
                  size={isTablet ? 32 : 28}
                  color="#0072B5"
                />
              </View>

              <Text style={styles.eyebrow}>
                VERIFY YOUR EMAIL
              </Text>

              <Text style={styles.title}>
                Check your inbox
              </Text>

              <Text style={styles.subtitle}>
                We sent a verification link to
              </Text>

              <View style={styles.emailPill}>
                <Ionicons
                  name="mail-outline"
                  size={isTablet ? 17 : 15}
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
                Tap the link in the email to verify
                your account
                and finish setting
                things up.
              </Text>

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
                        Resend Verification Email
                      </Text>
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
                  Back to Login
                </Text>
              </Pressable>
            </View>
          )}

          {isLoading && (
            <View style={styles.stateContainer}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={isTablet ? 32 : 29}
                  color="#0072B5"
                />
              </View>

              <Text style={styles.eyebrow}>
                EMAIL VERIFICATION
              </Text>

              <Text style={styles.title}>
                Verifying your email
              </Text>

              <Text style={styles.subtitle}>
                Please wait while we securely verify
                your email address.
              </Text>

              <View style={styles.loadingCard}>
                <ActivityIndicator
                  size="small"
                  color="#0072B5"
                />

                <Text style={styles.loadingText}>
                  Verifying account...
                </Text>
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
                  size={isTablet ? 34 : 30}
                  color="#16A34A"
                />
              </View>

              <Text style={styles.eyebrow}>
                EMAIL VERIFIED
              </Text>

              <Text style={styles.title}>
                You're all set
              </Text>

              <Text style={styles.subtitle}>
                Your email has been successfully
                verified.
              </Text>

              <View style={styles.successCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#16A34A"
                />

                <Text style={styles.successText}>
                  Taking you to login...
                </Text>
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
                  size={isTablet ? 34 : 30}
                  color="#DC2626"
                />
              </View>

              <Text style={styles.eyebrow}>
                VERIFICATION FAILED
              </Text>

              <Text style={styles.title}>
                Link is invalid or expired
              </Text>

              <Text style={styles.subtitle}>
                This verification link is no longer
                valid. Please request a new one.
              </Text>

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
                        Resend Verification Email
                      </Text>
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
                  Back to Login
                </Text>
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
            Your information is securely encrypted.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#F7F9FC",
    },

    container: {
      flex: 1,
      paddingHorizontal: isTablet ? 48 : 24,
      paddingTop: isTablet ? 24 : 12,
      paddingBottom: isTablet ? 28 : 20,
    },

    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    brand: {
      marginBottom: isTablet ? 38 : 34,
    },

    logoContainer: {
      width: isTablet ? 92 : 76,
      height: isTablet ? 92 : 76,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 30,
      shadowColor: "#0F172A",
      shadowOpacity: 0.06,
      shadowRadius: isTablet ? 20 : 16,
      shadowOffset: {
        width: 0,
        height: isTablet ? 8 : 6,
      },

      elevation: 3,
    },

    stateContainer: {
      width: "100%",
      maxWidth: isTablet ? 560 : 430,
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet ? 30 : 24,
      paddingHorizontal: isTablet ? 42 : 26,
      paddingTop: isTablet ? 38 : 28,
      paddingBottom: isTablet ? 36 : 26,

      borderWidth: 1,
      borderColor: "#E5EAF0",

      shadowColor: "#0F172A",
      shadowOpacity: 0.05,
      shadowRadius: isTablet ? 24 : 18,
      shadowOffset: {
        width: 0,
        height: isTablet ? 10 : 7,
      },

      elevation: 3,
    },

    iconCircle: {
      width: isTablet ? 76 : 64,
      height: isTablet ? 76 : 64,
      borderRadius: isTablet ? 24 : 20,
      backgroundColor: "#EAF4FB",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isTablet ? 21 : 17,
    },

    successCircle: {
      backgroundColor: "#DCFCE7",
    },

    errorCircle: {
      backgroundColor: "#FEE2E2",
    },

    eyebrow: {
      fontSize: isTablet ? 9 : 8,
      fontWeight: "800",
      letterSpacing: 1.35,
      color: "#94A3B8",
      marginBottom: isTablet ? 8 : 6,
    },

    title: {
      fontSize: isTablet ? 34 : 28,
      lineHeight: isTablet ? 40 : 33,
      fontWeight: "800",
      letterSpacing: -0.7,
      color: "#273449",
      textAlign: "center",
    },

    subtitle: {
      maxWidth: isTablet ? 430 : 340,
      marginTop: isTablet ? 12 : 9,
      fontSize: isTablet ? 15 : 13,
      lineHeight: isTablet ? 22 : 19,
      color: "#64748B",
      textAlign: "center",
    },

    emailPill: {
      maxWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: isTablet ? 17 : 14,
      paddingHorizontal: isTablet ? 16 : 13,
      paddingVertical: isTablet ? 10 : 8,
      borderRadius: 12,
      backgroundColor: "#F0F8FD",
      borderWidth: 1,
      borderColor: "#D7EAF5",
    },

    emailText: {
      flexShrink: 1,
      fontSize: isTablet ? 14 : 12,
      fontWeight: "700",
      color: "#0072B5",
    },

    helperText: {
      maxWidth: isTablet ? 440 : 330,
      marginTop: isTablet ? 16 : 13,
      fontSize: isTablet ? 13 : 12,
      lineHeight: isTablet ? 20 : 18,
      color: "#94A3B8",
      textAlign: "center",
    },

    button: {
      width: "100%",
      maxWidth: isTablet ? 440 : 370,
      height: isTablet ? 58 : 54,
      marginTop: isTablet ? 30 : 26,
      paddingHorizontal: 24,
      borderRadius: isTablet ? 16 : 15,
      backgroundColor: "#0072B5",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,

      shadowColor: "#0072B5",
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 3,
    },

    buttonPressed: {
      backgroundColor: "#005F97",
      transform: [{ scale: 0.985 }],
    },

    buttonDisabled: {
      opacity: 0.65,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: isTablet ? 15 : 14,
      fontWeight: "800",
    },

    secondaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      minHeight: 44,
      marginTop: 10,
      paddingHorizontal: 18,
    },

    secondaryButtonPressed: {
      opacity: 0.55,
    },

    secondaryButtonText: {
      color: "#64748B",
      fontSize: isTablet ? 14 : 13,
      fontWeight: "700",
    },

    loadingCard: {
      width: "100%",
      maxWidth: isTablet ? 400 : 330,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: isTablet ? 26 : 22,
      paddingVertical: isTablet ? 15 : 13,
      paddingHorizontal: 18,
      borderRadius: 13,
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#E8EEF5",
    },

    loadingText: {
      fontSize: isTablet ? 13 : 12,
      fontWeight: "700",
      color: "#64748B",
    },

    successCard: {
      width: "100%",
      maxWidth: isTablet ? 400 : 330,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      marginTop: isTablet ? 26 : 22,
      paddingVertical: isTablet ? 15 : 13,
      paddingHorizontal: 18,
      borderRadius: 13,
      backgroundColor: "#F0FDF4",
      borderWidth: 1,
      borderColor: "#DCFCE7",
    },

    successText: {
      fontSize: isTablet ? 13 : 12,
      fontWeight: "700",
      color: "#15803D",
    },

    security: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingTop: isTablet ? 24 : 20,
    },

    securityIcon: {
      width: isTablet ? 28 : 25,
      height: isTablet ? 28 : 25,
      borderRadius: isTablet ? 9 : 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E5EAF0",
    },

    securityText: {
      fontSize: isTablet ? 11 : 10,
      color: "#94A3B8",
    },
  });