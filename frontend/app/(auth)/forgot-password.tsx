import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import Logo from "../../assets/images/logo.svg";

import { forgotPassword } from "@/features/auth/api/auth.api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,

    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = () => {
    Keyboard.dismiss();

    if (!email.trim()) {
      return;
    }

    forgotPasswordMutation.mutate({
      email: email.trim(),
    });
  };

  const isDisabled =
    !email.trim() ||
    forgotPasswordMutation.isPending;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <View style={styles.backIcon}>
                <Ionicons
                  name="arrow-back"
                  size={17}
                  color="#475569"
                />
              </View>

              <Text style={styles.backText}>
                Back to Sign In
              </Text>
            </Pressable>

            <View style={styles.content}>
              {!submitted ? (
                <>
                  <View style={styles.brand}>
                    <Logo
                      width={48}
                      height={48}
                      color="#0072B5"
                    />
                  </View>

                  <View style={styles.header}>
                    <Text style={styles.eyebrow}>
                      ACCOUNT RECOVERY
                    </Text>

                    <Text style={styles.title}>
                      Reset your password
                    </Text>

                    <Text style={styles.subtitle}>
                      Enter the email associated with your
                      account and we'll send you a secure
                      reset link.
                    </Text>
                  </View>

                  <View style={styles.formCard}>
                    <View style={styles.field}>
                      <Text style={styles.label}>
                        EMAIL ADDRESS
                      </Text>

                      <View
                        style={[
                          styles.inputContainer,
                          email.length > 0 &&
                            styles.inputContainerActive,
                        ]}
                      >
                        <View style={styles.inputIcon}>
                          <Ionicons
                            name="mail-outline"
                            size={17}
                            color="#0072B5"
                          />
                        </View>

                        <TextInput
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="email-address"
                          textContentType="emailAddress"
                          placeholder="you@example.com"
                          placeholderTextColor="#A0AEC0"
                          editable={
                            !forgotPasswordMutation.isPending
                          }
                          style={styles.input}
                          returnKeyType="send"
                          onSubmitEditing={handleSubmit}
                        />
                      </View>
                    </View>

                    {forgotPasswordMutation.isError && (
                      <View style={styles.errorContainer}>
                        <View style={styles.errorIcon}>
                          <Ionicons
                            name="alert-outline"
                            size={14}
                            color="#DC2626"
                          />
                        </View>

                        <Text style={styles.errorText}>
                          Something went wrong. Please try
                          again.
                        </Text>
                      </View>
                    )}

                    <Pressable
                      disabled={isDisabled}
                      style={[
                        styles.button,
                        isDisabled &&
                          styles.buttonDisabled,
                      ]}
                      onPress={handleSubmit}
                    >
                      {forgotPasswordMutation.isPending ? (
                        <>
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                          />

                          <Text style={styles.buttonText}>
                            Sending reset link...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.buttonText}>
                            Send Reset Link
                          </Text>

                          <Ionicons
                            name="arrow-forward"
                            size={17}
                            color="#FFFFFF"
                          />
                        </>
                      )}
                    </Pressable>

                    <View style={styles.formHint}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={13}
                        color="#94A3B8"
                      />

                      <Text style={styles.formHintText}>
                        Your reset link will be securely
                        encrypted.
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.success}>
                  <View style={styles.successLogo}>
                    <Logo
                      width={42}
                      height={42}
                      color="#0072B5"
                    />
                  </View>

                  <Text style={styles.successEyebrow}>
                    REQUEST RECEIVED
                  </Text>

                  <Text style={styles.successTitle}>
                    Check your email
                  </Text>

                  <Text style={styles.successSubtitle}>
                    If an account exists for{" "}
                    <Text style={styles.emailHighlight}>
                      {email.trim()}
                    </Text>
                    , we've sent a secure link to reset
                    your password.
                  </Text>

                  <View style={styles.successCard}>
                    <View style={styles.successRow}>
                      <View style={styles.successCheck}>
                        <Ionicons
                          name="checkmark"
                          size={15}
                          color="#0072B5"
                        />
                      </View>

                      <View style={styles.successTextContainer}>
                        <Text style={styles.successCardTitle}>
                          Check your inbox
                        </Text>

                        <Text style={styles.successCardText}>
                          The reset link may take a few
                          moments to arrive.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.successDivider} />

                    <View style={styles.successRow}>
                      <View style={styles.successCheck}>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={15}
                          color="#0072B5"
                        />
                      </View>

                      <View style={styles.successTextContainer}>
                        <Text style={styles.successCardTitle}>
                          Link expires for security
                        </Text>

                        <Text style={styles.successCardText}>
                          Use the link promptly to reset
                          your password.
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.successActions}>
                    <Pressable
                      style={styles.returnButton}
                      onPress={() => router.back()}
                    >
                      <Ionicons
                        name="arrow-back"
                        size={16}
                        color="#0072B5"
                      />

                      <Text style={styles.returnButtonText}>
                        Return to Sign In
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.tryAgainButton}
                      onPress={() => {
                        setSubmitted(false);
                        forgotPasswordMutation.reset();
                      }}
                    >
                      <Text style={styles.tryAgainText}>
                        Use a different email
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.security}>
              <View style={styles.securityIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#0072B5"
                />
              </View>

              <Text style={styles.securityText}>
                Your information is securely encrypted.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
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

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 18,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingVertical: 7,
  },

  backIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7EF",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  brand: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  header: {
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.35,
    color: "#94A3B8",
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#273449",
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 335,
    marginTop: 9,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
  },

  formCard: {
    marginTop: 28,
    padding: 17,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7EF",
  },

  field: {
    width: "100%",
  },

  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.05,
    color: "#64748B",
    marginBottom: 8,
  },

  inputContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FAFBFC",
  },

  inputContainerActive: {
    borderColor: "#9FCBE0",
    backgroundColor: "#FFFFFF",
  },

  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EAF4FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#273449",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 10,
    borderRadius: 11,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorIcon: {
    width: 23,
    height: 23,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#B91C1C",
  },

  button: {
    height: 52,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: "#0072B5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    shadowColor: "#0072B5",
    shadowOpacity: 0.15,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  formHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 13,
  },

  formHintText: {
    fontSize: 9,
    color: "#94A3B8",
  },

  success: {
    alignItems: "center",
  },

  successLogo: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#EAF4FA",
    borderWidth: 1,
    borderColor: "#D3E8F3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  successEyebrow: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#94A3B8",
    marginBottom: 6,
  },

  successTitle: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#273449",
    textAlign: "center",
  },

  successSubtitle: {
    maxWidth: 335,
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  emailHighlight: {
    fontWeight: "700",
    color: "#475569",
  },

  successCard: {
    width: "100%",
    marginTop: 24,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7EF",
  },

  successRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  successCheck: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EAF4FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  successTextContainer: {
    flex: 1,
  },

  successCardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  successCardText: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    color: "#94A3B8",
  },

  successDivider: {
    height: 1,
    backgroundColor: "#EEF2F6",
    marginVertical: 13,
  },

  successActions: {
    width: "100%",
    marginTop: 22,
    alignItems: "center",
  },

  returnButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CFE3EE",
    backgroundColor: "#F4FAFD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  returnButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0072B5",
  },

  tryAgainButton: {
    paddingVertical: 13,
  },

  tryAgainText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },

  security: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 18,
  },

  securityIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#EAF4FA",
    alignItems: "center",
    justifyContent: "center",
  },

  securityText: {
    fontSize: 9,
    color: "#94A3B8",
  },
});