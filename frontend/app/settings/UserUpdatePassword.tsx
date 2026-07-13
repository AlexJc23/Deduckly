import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUpdatePassword } from "@/features/auth/hooks/use-update-password";

import { clearTokens } from "@/features/auth/services/auth-service.service";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";


export default function UserUpdatePassword() {
  const userQuery = useCurrentUser();
  const updatePasswordMutation = useUpdatePassword();
  const queryClient = useQueryClient();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

    const [showNewPassword, setShowNewPassword] =
    useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const passwordsMatch = newPassword === confirmNewPassword;
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*]/.test(newPassword);
  const [error, setError] = useState<string | null>(null);

  
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
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      router.replace("/(auth)/login");
    } catch (err) {
      setError("Failed to update password. Please try again.");
    }
  };

  const canSubmit =
    oldPassword.length > 0 &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    passwordsMatch;
  return (
    <View style={{ flex: 1, padding: 20, margin: "auto", justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Update Password</Text>
      <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  }}
>
  <TextInput
    placeholder="Old Password"
    secureTextEntry={!showCurrentPassword}
    value={oldPassword}
    onChangeText={setOldPassword}
    style={{
      flex: 1,
      paddingVertical: 10,
    }}
  />

  <Pressable
    onPress={() =>
      setShowCurrentPassword(
        !showCurrentPassword
      )
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
      <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 30,
    paddingHorizontal: 10,
  }}
>
  <TextInput
    placeholder="New Password"
    secureTextEntry={!showNewPassword}
    value={newPassword}
    onChangeText={setNewPassword}
    style={{
      flex: 1,
      paddingVertical: 10,
    }}
  />

  <Pressable
    onPress={() =>
      setShowNewPassword(
        !showNewPassword
      )
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

      <View style={{ marginBottom: 30 }}>
        <Text style={{ marginBottom: 10 }}>
            Passwords must contain:
        </Text>
        <Text style={{ color: hasMinLength ? "green" : "red" }}>
            - At least 8 characters
        </Text>
        <Text style={{ color: hasUppercase ? "green" : "red" }}>
            - At least 1 uppercase letter
        </Text>
        <Text style={{ color: hasLowercase ? "green" : "red" }}>
            - At least 1 lowercase letter
        </Text>
        <Text style={{ color: hasNumber ? "green" : "red" }}>
            - At least 1 number
        </Text>
        <Text style={{ color: hasSpecialChar ? "green" : "red" }}>
            - At least 1 special character (e.g., !@#$%^&*)
        </Text>
      </View>




      <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  }}
>
  <TextInput
    placeholder="Confirm New Password"
    secureTextEntry={!showConfirmPassword}
    value={confirmNewPassword}
    onChangeText={setConfirmNewPassword}
    style={{
      flex: 1,
      paddingVertical: 10,
    }}
  />

  <Pressable
    onPress={() =>
      setShowConfirmPassword(
        !showConfirmPassword
      )
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
      {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}
      <Pressable
        onPress={handleUpdatePassword}
        style={{
          backgroundColor: "#007BFF",
          padding: 15,
          alignItems: "center",
          borderRadius: 5,
        }}
        disabled={!canSubmit || updatePasswordMutation.status === "pending"}
      >
        {updatePasswordMutation.status === "pending" ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff" }}>Update Password</Text>
        )}
      </Pressable>

      <Pressable 
        onPress={() => router.back()} 
        style={{
        //   backgroundColor: "#ffffff",
          marginTop: 10,
          padding: 15,
          alignItems: "center",
          borderRadius: 5,
        }}
      >
        <Text>
            Cancel
        </Text>
      </Pressable>
    </View>
  );
}