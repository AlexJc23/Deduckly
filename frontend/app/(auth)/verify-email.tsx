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

export default function VerifyEmail() {
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
            <Logo
              width={58}
              height={58}
              color="#0072B5"
            />
          </View>

          {!token && (
            <>
              <Ionicons
                name="mail-outline"
                size={42}
                color="#0072B5"
              />

              <Text style={styles.eyebrow}>
                VERIFY YOUR EMAIL
              </Text>

              <Text style={styles.title}>
                Check your inbox
              </Text>

              <Text style={styles.subtitle}>
                We sent a verification link to{" "}
                {email || "your email address"}.
              </Text>

              <Text style={styles.subtitle}>
                Tap the link in the email to verify
                your account.
              </Text>

              {email && (
                <Pressable
                  disabled={
                    resendVerificationMutation.isPending
                  }
                  style={styles.button}
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
                    <Text style={styles.buttonText}>
                      Resend Verification Email
                    </Text>
                  )}
                </Pressable>
              )}

              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  router.replace("/(auth)/login")
                }
              >
                <Text style={styles.secondaryButtonText}>
                  Back to Login
                </Text>
              </Pressable>
            </>
          )}

          {isLoading && (
            <>
              <Ionicons
                name="mail-outline"
                size={42}
                color="#0072B5"
              />

              <Text style={styles.eyebrow}>
                EMAIL VERIFICATION
              </Text>

              <Text style={styles.title}>
                Verifying your email
              </Text>

              <Text style={styles.subtitle}>
                Please wait while we verify your
                email address.
              </Text>

              <ActivityIndicator
                size="small"
                color="#0072B5"
                style={styles.loader}
              />
            </>
          )}

          {isSuccess && (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={48}
                color="#16A34A"
              />

              <Text style={styles.eyebrow}>
                EMAIL VERIFIED
              </Text>

              <Text style={styles.title}>
                You're all set
              </Text>

              <Text style={styles.subtitle}>
                Your email has been successfully
                verified. Taking you to login...
              </Text>
            </>
          )}

          {isError && (
            <>
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color="#DC2626"
              />

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
                  style={styles.button}
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
                    <Text style={styles.buttonText}>
                      Resend Verification Email
                    </Text>
                  )}
                </Pressable>
              )}

              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  router.replace("/(auth)/login")
                }
              >
                <Text style={styles.secondaryButtonText}>
                  Back to Login
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.security}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color="#94A3B8"
          />

          <Text style={styles.securityText}>
            Your information is securely encrypted.
          </Text>
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
    marginBottom: 30,
  },

  eyebrow: {
    marginTop: 20,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#64748B",
  },

  title: {
    marginTop: 7,
    fontSize: 30,
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

  loader: {
    marginTop: 24,
  },

  button: {
    height: 54,
    minWidth: 180,
    marginTop: 28,
    paddingHorizontal: 24,
    borderRadius: 15,
    backgroundColor: "#0072B5",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  security: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 20,
  },

  securityText: {
    fontSize: 10,
    color: "#94A3B8",
  },

  secondaryButton: {
    height: 48,
    marginTop: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },
});