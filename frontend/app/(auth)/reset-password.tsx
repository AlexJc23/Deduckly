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
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import Logo from "../../assets/images/logo.svg";

import { resetPassword } from "@/features/auth/api/auth.api";

export default function ResetPassword() {
  const { token } = useLocalSearchParams<{
    token?: string;
  }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,

    onSuccess: () => {
      router.replace("/(auth)/login");
    },
  });

  const handleResetPassword = () => {
    Keyboard.dismiss();

    if (!token) {
      return;
    }

    if (!password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    resetPasswordMutation.mutate({
      token,
      new_password: password,
    });
  };

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const isDisabled =
    !token ||
    !password ||
    !confirmPassword ||
    passwordsDoNotMatch ||
    resetPasswordMutation.isPending;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#273449"
            />

            <Text style={styles.backText}>
              Back
            </Text>
          </Pressable>

          <View style={styles.content}>
            <View style={styles.brand}>
              <Logo
                width={58}
                height={58}
                color="#0072B5"
              />
            </View>

            <View style={styles.header}>
              <Text style={styles.eyebrow}>
                ACCOUNT RECOVERY
              </Text>

              <Text style={styles.title}>
                Create a new password
              </Text>

              <Text style={styles.subtitle}>
                Choose a strong password for your
                Deduckly account.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>
                  New password
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#94A3B8"
                  />

                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    textContentType="newPassword"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Enter new password"
                    placeholderTextColor="#A0AEC0"
                    editable={
                      !resetPasswordMutation.isPending
                    }
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Confirm password
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    passwordsDoNotMatch &&
                      styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#94A3B8"
                  />

                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    textContentType="newPassword"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Confirm new password"
                    placeholderTextColor="#A0AEC0"
                    editable={
                      !resetPasswordMutation.isPending
                    }
                    returnKeyType="done"
                    onSubmitEditing={
                      handleResetPassword
                    }
                    style={styles.input}
                  />
                </View>

                {passwordsDoNotMatch && (
                  <Text style={styles.validationText}>
                    Passwords do not match.
                  </Text>
                )}
              </View>

              {resetPasswordMutation.isError && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={17}
                    color="#DC2626"
                  />

                  <Text style={styles.errorText}>
                    This reset link is invalid or has
                    expired. Please request a new one.
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
                onPress={handleResetPassword}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text style={styles.buttonText}>
                      Resetting...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.buttonText}>
                      Reset Password
                    </Text>

                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </Pressable>
            </View>
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

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 8,
  },

  backText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#273449",
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  brand: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  header: {
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#64748B",
    marginBottom: 7,
  },

  title: {
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

  form: {
    marginTop: 32,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 8,
  },

  inputContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FFFFFF",
  },

  inputError: {
    borderColor: "#FCA5A5",
  },

  input: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 15,
    color: "#273449",
  },

  validationText: {
    marginTop: 6,
    fontSize: 11,
    color: "#B91C1C",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: -4,
    marginBottom: 14,
    padding: 11,
    borderRadius: 11,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#B91C1C",
  },

  button: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#0072B5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  buttonDisabled: {
    opacity: 0.45,
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
});