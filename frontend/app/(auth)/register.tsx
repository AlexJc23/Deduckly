import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "@/theme/components";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { router, Link } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";

import Logo from "../../assets/images/logo.svg";
import { useAuth } from "@/features/auth/context/auth.context";

import { startGoogleLogin } from "@/features/auth/api/google-auth.api";
import { register } from "@/features/auth/api/auth.api";
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function RegisterScreen() {
  const isTablet = useIsTablet();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
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
      console.error("Google registration failed:", error);
    }
  };

  const registerMutation = useMutation({
    mutationFn: register,

    onSuccess: () => {
      router.replace({ pathname: "/(auth)/verify-email", params: { email: email.trim() } });
    },

    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });

  const handleRegister = () => {
    Keyboard.dismiss();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password
    ) {
      return;
    }

    registerMutation.mutate({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      filing_status: "single",
      password,
    });
  };

  const isDisabled =
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !password ||
    registerMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={styles.keyboardDismissArea}
          onPress={Keyboard.dismiss}
        >
          <View
            style={[
              styles.container,
              isTablet && styles.containerTablet,
            ]}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[
                styles.scrollContent,
                isTablet && styles.scrollContentTablet,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              <View
                style={[
                  styles.content,
                  isTablet && styles.contentTablet,
                ]}
              >
                <View
                  style={[
                    styles.brand,
                    isTablet && styles.brandTablet,
                  ]}
                >
                  <Logo
                    width={isTablet ? 150 : 70}
                    height={isTablet ? 150 : 70}
                    color="#0072B5"
                  />
                </View>

                <View style={styles.header}>
                  <Text
                    style={[
                      styles.title,
                      isTablet && styles.titleTablet,
                    ]}
                  >
                    Let&apos;s get started!
                  </Text>

                  <Text
                    style={[
                      styles.subtitle,
                      isTablet && styles.subtitleTablet,
                    ]}
                  >
                    Your miles, money, and work, all in one place
                  </Text>
                </View>

                {/* Google */}
                <View
                  style={[
                    styles.socialSection,
                    isTablet && styles.socialSectionTablet,
                  ]}
                >
                  <Pressable
                    style={[
                      styles.googleButton,
                      isTablet && styles.googleButtonTablet,
                    ]}
                    onPress={handleGoogleAuth}
                    disabled={registerMutation.isPending}
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
                </View>

                <View
                  style={[
                    styles.form,
                    isTablet && styles.formTablet,
                  ]}
                >
                  {/* First + Last Name */}

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <Text style={styles.label}>
                        First name
                      </Text>

                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First name"
                        placeholderTextColor="#A0AEC0"
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={!registerMutation.isPending}
                        returnKeyType="next"
                        style={[
                          styles.input,
                          isTablet && styles.inputTablet,
                        ]}
                      />
                    </View>

                    <View style={styles.halfField}>
                      <Text style={styles.label}>
                        Last name
                      </Text>

                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last name"
                        placeholderTextColor="#A0AEC0"
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={!registerMutation.isPending}
                        returnKeyType="next"
                        style={[
                          styles.input,
                          isTablet && styles.inputTablet,
                        ]}
                      />
                    </View>
                  </View>

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
                        placeholder="you@example.com"
                        placeholderTextColor="#A0AEC0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                        editable={!registerMutation.isPending}
                        returnKeyType="next"
                        style={styles.inputWithIcon}
                      />
                    </View>
                  </View>

                  {/* Password */}

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Password
                    </Text>

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
                        placeholder="Create a password"
                        placeholderTextColor="#A0AEC0"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        editable={!registerMutation.isPending}
                        returnKeyType="done"
                        onSubmitEditing={handleRegister}
                        style={styles.inputWithIcon}
                      />

                      <Pressable
                        onPress={() =>
                          setShowPassword(
                            (current) => !current
                          )
                        }
                        hitSlop={10}
                        disabled={
                          registerMutation.isPending
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
                  </View>

                  {/* Error */}

                  {registerMutation.isError && (
                    <View style={styles.errorContainer}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={17}
                        color="#DC2626"
                      />

                      <Text style={styles.errorText}>
                        Unable to create your account. Please
                        check your information and try again.
                      </Text>
                    </View>
                  )}

                  {/* Register */}

                  <Pressable
                    disabled={isDisabled}
                    style={[
                      styles.button,
                      isTablet && styles.buttonTablet,
                      isDisabled &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handleRegister}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                        />

                        <Text style={styles.buttonText}>
                          Creating Account...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.buttonText}>
                          Create Account
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

                {/* Sign In */}

                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>
                    Already have an account?
                  </Text>

                  <Link
                    href="/(auth)/login"
                    asChild
                  >
                    <Pressable>
                      <Text style={styles.loginLink}>
                        Sign in
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </ScrollView>


            
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  keyboardView: {
    flex: 1,
  },

  keyboardDismissArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },

  containerTablet: {
    paddingHorizontal: 48,
    paddingTop: 18,
    paddingBottom: 28,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  scrollContentTablet: {
    alignItems: "center",
    paddingBottom: 32,
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
    width: "100%",
  },

  contentTablet: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    justifyContent: "center",
  },

  brand: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  brandTablet: {
    marginBottom: 34,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
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
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  subtitleTablet: {
    maxWidth: 430,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },

  socialSection: {
    marginTop: 12,
  },

  socialSectionTablet: {
    marginTop: 16,
  },

  form: {
    marginTop: 4,
  },

  formTablet: {
    marginTop: 4,
    width: "100%",
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  halfField: {
    flex: 1,
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

  input: {
    height: 54,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#273449",
  },

  inputTablet: {
    height: 58,
    borderRadius: 15,
    fontSize: 16,
    paddingHorizontal: 17,
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

  inputWithIcon: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 15,
    color: "#273449",
    textAlignVertical: "center",
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

  buttonTablet: {
    height: 58,
    borderRadius: 16,
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
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
  },

  googleButtonTablet: {
    height: 58,
    borderRadius: 16,
  },

  googleButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#273449",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 5,
  },

  loginText: {
    fontSize: 12,
    color: "#94A3B8",
  },

  loginLink: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0072B5",
  },

  security: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 20,
  },

  securityTablet: {
    paddingTop: 28,
  },

  securityText: {
    fontSize: 10,
    color: "#94A3B8",
  },
});