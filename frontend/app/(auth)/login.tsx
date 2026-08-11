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
import { router, Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import Logo from "../../assets/images/logo.svg";

import { login } from "@/features/auth/api/auth.api";
import { saveTokens } from "@/features/auth/services/auth-service.service";
import { useAuth } from "@/features/auth/context/auth.context";
import { setTemporaryToken } from "@/features/auth/services/twofa-storage.service";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useAuth();

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: async (data) => {
      if (!data.refresh_token) {
        await setTemporaryToken(data.access_token);

        router.push("/(auth)/verify-2fa");
        return;
      }

      await saveTokens(
        data.access_token,
        data.refresh_token,
      );

      signIn();

      router.replace("/(tabs)/dashboard");
    },

    onError: (error) => {
      console.log("Login failed:", error);
    },
  });

  const handleLogin = () => {
    Keyboard.dismiss();

    if (!email.trim() || !password) {
      return;
    }

    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  const isDisabled =
    !email.trim() ||
    !password ||
    loginMutation.isPending;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          style={styles.flex}
          onPress={Keyboard.dismiss}
        >
          <View style={styles.container}>
            {/* Logo */}

            <View style={styles.brand}>
              <Logo
                width={58}
                height={58}
                color="#0072B5"
              />
            </View>

            {/* Header */}

            <View style={styles.header}>
              <Text style={styles.eyebrow}>
                WELCOME BACK
              </Text>

              <Text style={styles.title}>
                Sign in to your account
              </Text>

              <Text style={styles.subtitle}>
                Keep your income, expenses, and
                mileage organized in one place.
              </Text>
            </View>

            {/* Form */}

            <View style={styles.form}>
              {/* Email */}

              <View style={styles.field}>
                <Text style={styles.label}>
                  Email
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#94A3B8"
                  />

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
                      !loginMutation.isPending
                    }
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Password */}

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    Password
                  </Text>

                  <Pressable
                    onPress={() =>
                      router.push("/(auth)/forgot-password")
                    }
                  >
                    <Text style={styles.forgotText}>
                      Forgot password?
                    </Text>
                  </Pressable>
                </View>

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
                    textContentType="password"
                    placeholder="Enter your password"
                    placeholderTextColor="#A0AEC0"
                    editable={
                      !loginMutation.isPending
                    }
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Error */}

              {loginMutation.isError && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={17}
                    color="#DC2626"
                  />

                  <Text style={styles.errorText}>
                    Please check your email and
                    password and try again.
                  </Text>
                </View>
              )}

              {/* Sign In */}

              <Pressable
                disabled={isDisabled}
                style={[
                  styles.signInButton,
                  isDisabled &&
                    styles.signInButtonDisabled,
                ]}
                onPress={handleLogin}
              >
                {loginMutation.isPending ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text style={styles.buttonText}>
                      Signing in...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.buttonText}>
                      Sign In
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </Pressable>
            </View>

            {/* Register */}

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <Link
                href="/(auth)/register"
                asChild
              >
                <Pressable>
                  <Text style={styles.registerLink}>
                    Create one
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Security */}

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
    paddingTop: 20,
    paddingBottom: 20,
  },

  brand: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    marginTop: 34,
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
    marginTop: 9,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  form: {
    marginTop: 34,
  },

  field: {
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 8,
  },

  forgotText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0072B5",
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

  input: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 15,
    color: "#273449",
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

  signInButton: {
    height: 54,
    borderRadius: 15,
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

  signInButtonDisabled: {
    opacity: 0.45,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    gap: 5,
  },

  registerText: {
    fontSize: 13,
    color: "#64748B",
  },

  registerLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0072B5",
  },

  security: {
    marginTop: "auto",
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