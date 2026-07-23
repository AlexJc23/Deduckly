import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useUpdatePassword } from "@/features/auth/hooks/use-update-password";
import { clearTokens } from "@/features/auth/services/auth-service.service";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { BackHeader } from "@/components/ui/BackButton";

export default function UserUpdatePassword() {
  const updatePasswordMutation = useUpdatePassword();
  const queryClient = useQueryClient();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = newPassword === confirmNewPassword;
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*]/.test(newPassword);

  const canSubmit =
    oldPassword.length > 0 &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    passwordsMatch;

  const handleUpdatePassword = async () => {
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
      });

      setError(null);

      clearTokens();
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });

      router.replace("/(auth)/login");
    } catch {
      setError("Failed to update password. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <BackHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Update Password</Text>
        <Text style={styles.subtitle}>
          Choose a strong password to help keep your account secure.
        </Text>

        {/* Current Password */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Current Password"
            secureTextEntry={!showCurrentPassword}
            value={oldPassword}
            onChangeText={setOldPassword}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={() =>
              setShowCurrentPassword(!showCurrentPassword)
            }
          >
            <Ionicons
              name={
                showCurrentPassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={22}
              color="#6B7280"
            />
          </Pressable>
        </View>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="New Password"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={() =>
              setShowNewPassword(!showNewPassword)
            }
          >
            <Ionicons
              name={
                showNewPassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={22}
              color="#6B7280"
            />
          </Pressable>
        </View>

        {/* Password Rules */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Password Requirements
          </Text>

          <Text
            style={[
              styles.rule,
              hasMinLength
                ? styles.success
                : styles.errorText,
            ]}
          >
            • At least 8 characters
          </Text>

          <Text
            style={[
              styles.rule,
              hasUppercase
                ? styles.success
                : styles.errorText,
            ]}
          >
            • At least 1 uppercase letter
          </Text>

          <Text
            style={[
              styles.rule,
              hasLowercase
                ? styles.success
                : styles.errorText,
            ]}
          >
            • At least 1 lowercase letter
          </Text>

          <Text
            style={[
              styles.rule,
              hasNumber
                ? styles.success
                : styles.errorText,
            ]}
          >
            • At least 1 number
          </Text>

          <Text
            style={[
              styles.rule,
              hasSpecialChar
                ? styles.success
                : styles.errorText,
            ]}
          >
            • At least 1 special character (!@#$%^&*)
          </Text>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Confirm New Password"
            secureTextEntry={!showConfirmPassword}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            <Ionicons
              name={
                showConfirmPassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={22}
              color="#6B7280"
            />
          </Pressable>
        </View>

        {!passwordsMatch &&
          confirmNewPassword.length > 0 && (
            <Text style={styles.errorMessage}>
              Passwords do not match.
            </Text>
          )}

        {error && (
          <Text style={styles.errorMessage}>{error}</Text>
        )}

        <Pressable
          style={[
            styles.primaryButton,
            !canSubmit && styles.disabledButton,
          ]}
          disabled={
            !canSubmit ||
            updatePasswordMutation.status === "pending"
          }
          onPress={handleUpdatePassword}
        >
          {updatePasswordMutation.status === "pending" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              Update Password
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>
            Cancel
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  rule: {
    fontSize: 15,
    marginBottom: 8,
  },
  success: {
    color: "#16A34A",
  },
  errorText: {
    color: "#DC2626",
  },
  errorMessage: {
    color: "#DC2626",
    marginBottom: 16,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#2DBE60",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 18,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});