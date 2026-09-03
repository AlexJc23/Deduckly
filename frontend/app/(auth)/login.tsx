import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { router, Link } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";

import Logo from "../../assets/images/logo.svg";

import { login } from "@/features/auth/api/auth.api";
import { saveTokens } from "@/features/auth/services/auth-service.service";
import { useAuth } from "@/features/auth/context/auth.context";
import { setTemporaryToken } from "@/features/auth/services/twofa-storage.service";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { startGoogleLogin } from "@/features/auth/api/google-auth.api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        Animated.spring(keyboardOffset, {
          toValue: -Math.min(event.endCoordinates.height * 0.45, 260),
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      }
    );

    const hideSubscription = Keyboard.addListener(
      "keyboardWillHide",
      () => {
        Animated.spring(keyboardOffset, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardOffset]);

  const isTablet = useIsTablet();

  const { signIn } = useAuth();

  const handleGoogleAuth = async () => {
  try {
    const success = await startGoogleLogin();

    if (!success) {
      return;
    }

    signIn();

    router.replace("/(tabs)/dashboard");
  } catch (error) {
    console.error("Google login failed:", error);
  }
};

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

    onError: (error: any) => {
      console.log(
        "Login failed:",
        JSON.stringify(
          error.response?.data,
          null,
          2,
        ),
      );

      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (
        status === 403 &&
        detail ===
          "Please verify your email before logging in."
      ) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: {
            email: email.trim(),
          },
        });

        return;
      }
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
          <Animated.View
            style={[
              styles.container,
              isTablet && styles.containerTablet,
              {
                transform: [{ translateY: keyboardOffset }],
              },
            ]}
          >
            <View
              style={[
                styles.brand,
                isTablet && styles.brandTablet,
              ]}
            >
              <Logo
                width={isTablet ? 72 : 100}
                height={isTablet ? 72 : 100}
                color="#0072B5"
              />
            </View>

            <View
              style={[
                styles.header,
                isTablet && styles.headerTablet,
              ]}
            >
              <Text
                style={[
                  styles.title,
                  isTablet && styles.titleTablet,
                ]}
              >
                Welcome back!
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  isTablet && styles.subtitleTablet,
                ]}
              >
                Log in to keep your miles, earnings, and expenses organized.
              </Text>
            </View>

            {/* Google */}

            <Pressable
              style={[
                styles.googleButton,
                isTablet && styles.googleButtonTablet,
              ]}
              onPress={handleGoogleAuth}
              disabled={loginMutation.isPending}
            >
              <FontAwesome6
                name="google"
                size={20}
              />

              <Text style={styles.googleButtonText}>
                Continue with Google
              </Text>
            </Pressable>

            {/* Divider */}

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />

              <Text style={styles.dividerText}>
                OR
              </Text>

              <View style={styles.divider} />
            </View>

            {/* Login Form */}

            <View
              style={[
                styles.form,
                isTablet && styles.formTablet,
              ]}
            >
              {/* Email */}

              <View style={styles.field}>
                <Text style={styles.label}>
                  Email
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    isTablet &&
                      styles.inputContainerTablet,
                  ]}
                >
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
                    editable={!loginMutation.isPending}
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
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    isTablet &&
                      styles.inputContainerTablet,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#94A3B8"
                  />

                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    textContentType="password"
                    placeholder="Enter your password"
                    placeholderTextColor="#A0AEC0"
                    editable={!loginMutation.isPending}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                    style={styles.input}
                  />

                  <Pressable
                    onPress={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    hitSlop={10}
                    disabled={
                      loginMutation.isPending
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={20}
                      color="#94A3B8"
                    />
                  </Pressable>
                </View>

                <Pressable
                  onPress={() =>
                    router.push(
                      "/(auth)/forgot-password",
                    )
                  }
                  style={styles.forgotButton}
                >
                  <Text style={styles.forgotText}>
                    Forgot password?
                  </Text>
                </Pressable>
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

              {/* Login */}

              <Pressable
                disabled={isDisabled}
                style={[
                  styles.signInButton,
                  isTablet &&
                    styles.signInButtonTablet,
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
                      Log In
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

            <View
              style={[
                styles.registerContainer,
                isTablet &&
                  styles.registerContainerTablet,
              ]}
            >
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
          </Animated.View>
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
    paddingTop: 10,
    paddingBottom: 20,
    top: "5%",
  },

  containerTablet: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingHorizontal: 40,
    paddingTop: 150,
    paddingBottom: 32,
  },

  brand: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  brandTablet: {
    marginBottom: 4,
  },

  header: {
    marginTop: 34,
    alignItems: "center",
  },

  headerTablet: {
    marginTop: 30,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  dividerText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#94A3B8",
  },

  googleButton: {
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 34,
  },

  googleButtonTablet: {
    height: 58,
    borderRadius: 16,
    marginTop: 38,
  },

  googleButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#273449",
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

  titleTablet: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
  },

  subtitle: {
    maxWidth: 340,
    marginTop: 9,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  subtitleTablet: {
    maxWidth: 430,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 11,
  },

  form: {
    marginTop: 4,
  },

  formTablet: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    marginTop: 4,
  },

  field: {
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 8,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 10,
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

  inputContainerTablet: {
    height: 58,
    borderRadius: 15,
    paddingHorizontal: 17,
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

  signInButtonTablet: {
    height: 58,
    borderRadius: 16,
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

  registerContainerTablet: {
    marginTop: 28,
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

  securityTablet: {
    paddingTop: 26,
  },

  securityText: {
    fontSize: 10,
    color: "#94A3B8",
  },
});