import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { router, Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import Logo from "../../assets/images/logo.svg";

import { saveTokens } from "@/features/auth/services/auth-service.service";
import { register } from "@/features/auth/api/auth.api";
import { useAuth } from "@/features/auth/context/auth.context";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [filingStatus, setFilingStatus] =
    useState("");

  const [
    showFilingStatusModal,
    setShowFilingStatusModal,
  ] = useState(false);

  const passwordsMatch =
    password === confirmPassword;

  const { signIn } = useAuth();

  const modalTranslateY = useRef(
    new Animated.Value(500)
  ).current;

  const filingStatuses = [
    {
      label: "Single",
      value: "single",
    },
    {
      label: "Married Filing Jointly",
      value: "married_filing_jointly",
    },
    {
      label: "Married Filing Separately",
      value: "married_filing_separately",
    },
    {
      label: "Head of Household",
      value: "head_of_household",
    },
  ];

  const registerMutation = useMutation({
    mutationFn: register,

    onSuccess: async (data) => {
      await saveTokens(
        data.access_token,
        data.refresh_token
      );

      signIn();

      router.replace("/(tabs)/dashboard");
    },

    onError: (error) => {
      console.error(
        "Registration failed:",
        error
      );
    },
  });

  useEffect(() => {
    if (!showFilingStatusModal) {
      return;
    }

    modalTranslateY.setValue(500);

    Animated.timing(modalTranslateY, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [
    showFilingStatusModal,
    modalTranslateY,
  ]);

  const handleRegister = () => {
    Keyboard.dismiss();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !filingStatus ||
      !passwordsMatch
    ) {
      return;
    }

    registerMutation.mutate({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password,
      filing_status: filingStatus,
    });
  };

  const isDisabled =
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !password ||
    !confirmPassword ||
    !filingStatus ||
    !passwordsMatch ||
    registerMutation.isPending;

  const selectedFilingStatus =
    filingStatuses.find(
      (status) =>
        status.value === filingStatus
    )?.label;

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
                GET STARTED
              </Text>

              <Text style={styles.title}>
                Create your account
              </Text>

              <Text style={styles.subtitle}>
                Set up Deduckly to keep your
                business income, expenses, and
                mileage organized.
              </Text>
            </View>

            {/* Form */}

            <View style={styles.form}>
              {/* Name */}

              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Text style={styles.label}>
                    First Name
                  </Text>

                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                    placeholderTextColor="#A0AEC0"
                    autoCapitalize="words"
                    textContentType="givenName"
                    editable={
                      !registerMutation.isPending
                    }
                    style={styles.input}
                  />
                </View>

                <View style={styles.nameField}>
                  <Text style={styles.label}>
                    Last Name
                  </Text>

                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                    placeholderTextColor="#A0AEC0"
                    autoCapitalize="words"
                    textContentType="familyName"
                    editable={
                      !registerMutation.isPending
                    }
                    style={styles.input}
                  />
                </View>
              </View>

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
                      !registerMutation.isPending
                    }
                    style={styles.inputWithIcon}
                  />
                </View>
              </View>

              {/* Password */}

              <View style={styles.field}>
                <Text style={styles.label}>
                  Password
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
                    placeholder="Create a password"
                    placeholderTextColor="#A0AEC0"
                    editable={
                      !registerMutation.isPending
                    }
                    style={styles.inputWithIcon}
                  />
                </View>
              </View>

              {/* Confirm Password */}

              <View style={styles.field}>
                <Text style={styles.label}>
                  Confirm Password
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    confirmPassword.length > 0 &&
                      !passwordsMatch &&
                      styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={
                      confirmPassword.length > 0 &&
                      !passwordsMatch
                        ? "#DC2626"
                        : "#94A3B8"
                    }
                  />

                  <TextInput
                    value={confirmPassword}
                    onChangeText={
                      setConfirmPassword
                    }
                    secureTextEntry
                    textContentType="newPassword"
                    placeholder="Confirm your password"
                    placeholderTextColor="#A0AEC0"
                    editable={
                      !registerMutation.isPending
                    }
                    style={styles.inputWithIcon}
                  />
                </View>

                {confirmPassword.length > 0 &&
                  !passwordsMatch && (
                    <Text style={styles.validationText}>
                      Passwords do not match.
                    </Text>
                  )}
              </View>

              {/* Filing Status */}

              <View style={styles.field}>
                <Text style={styles.label}>
                  Filing Status
                </Text>

                <Pressable
                  disabled={
                    registerMutation.isPending
                  }
                  style={styles.select}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowFilingStatusModal(true);
                  }}
                >
                  <View
                    style={styles.selectContent}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#94A3B8"
                    />

                    <Text
                      style={[
                        styles.selectText,
                        !selectedFilingStatus &&
                          styles.placeholderText,
                      ]}
                    >
                      {selectedFilingStatus ??
                        "Select filing status"}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color="#94A3B8"
                  />
                </Pressable>
              </View>

              {/* Registration Error */}

              {registerMutation.isError && (
                <View
                  style={styles.errorContainer}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={17}
                    color="#DC2626"
                  />

                  <Text style={styles.errorText}>
                    We couldn't create your
                    account. Please check your
                    information and try again.
                  </Text>
                </View>
              )}

              {/* Register */}

              <Pressable
                disabled={isDisabled}
                style={[
                  styles.registerButton,
                  isDisabled &&
                    styles.registerButtonDisabled,
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
                      Creating account...
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

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <Link
                href="/(auth)/login"
                asChild
              >
                <Pressable>
                  <Text style={styles.loginLink}>
                    Sign In
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
                Your information is securely
                encrypted.
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Filing Status Modal */}

        <Modal
          visible={showFilingStatusModal}
          transparent
          animationType="none"
          onRequestClose={() =>
            setShowFilingStatusModal(false)
          }
        >
          <View style={styles.modalContainer}>
            {/* Instant backdrop */}

            <Pressable
              style={styles.modalBackdrop}
              onPress={() =>
                setShowFilingStatusModal(false)
              }
            />

            {/* Sliding sheet */}

            <Animated.View
              style={[
                styles.modalSheet,
                {
                  transform: [
                    {
                      translateY:
                        modalTranslateY,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View>
                  <Text
                    style={styles.modalEyebrow}
                  >
                    TAX PROFILE
                  </Text>

                  <Text
                    style={styles.modalTitle}
                  >
                    Filing Status
                  </Text>
                </View>
              </View>

              <Text
                style={styles.modalDescription}
              >
                Select the filing status that
                applies to your tax return.
              </Text>

              <View style={styles.statusList}>
                {filingStatuses.map(
                  (status) => {
                    const selected =
                      filingStatus ===
                      status.value;

                    return (
                      <Pressable
                        key={status.value}
                        style={[
                          styles.statusOption,
                          selected &&
                            styles.statusOptionSelected,
                        ]}
                        onPress={() => {
                          setFilingStatus(
                            status.value
                          );

                          setShowFilingStatusModal(
                            false
                          );
                        }}
                      >
                        <View
                          style={[
                            styles.statusIcon,
                            selected &&
                              styles.statusIconSelected,
                          ]}
                        >
                          <Ionicons
                            name={
                              selected
                                ? "checkmark"
                                : "person-outline"
                            }
                            size={17}
                            color={
                              selected
                                ? "#0072B5"
                                : "#94A3B8"
                            }
                          />
                        </View>

                        <Text
                          style={[
                            styles.statusText,
                            selected &&
                              styles.statusTextSelected,
                          ]}
                        >
                          {status.label}
                        </Text>

                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#0072B5"
                          />
                        )}
                      </Pressable>
                    );
                  }
                )}
              </View>

              <Pressable
                style={styles.modalCancel}
                onPress={() =>
                  setShowFilingStatusModal(
                    false
                  )
                }
              >
                <Text
                  style={styles.modalCancelText}
                >
                  Cancel
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </Modal>
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
    paddingBottom: 16,
  },

  brand: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  header: {
    marginTop: 27,
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#64748B",
    marginBottom: 5,
  },

  title: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#273449",
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 340,
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
  },

  form: {
    marginTop: 23,
  },

  nameRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  nameField: {
    flex: 1,
  },

  field: {
    marginBottom: 13,
  },

  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 6,
  },

  input: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    fontSize: 14,
    color: "#273449",
  },

  inputContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FFFFFF",
  },

  inputWithIcon: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    fontSize: 14,
    color: "#273449",
  },

  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },

  validationText: {
    marginTop: 5,
    fontSize: 10,
    color: "#DC2626",
  },

  select: {
    height: 48,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  selectText: {
    marginLeft: 9,
    fontSize: 14,
    color: "#273449",
    fontWeight: "600",
  },

  placeholderText: {
    color: "#A0AEC0",
    fontWeight: "400",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: -2,
    marginBottom: 12,
    padding: 10,
    borderRadius: 11,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#B91C1C",
  },

  registerButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#0072B5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  registerButtonDisabled: {
    opacity: 0.45,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 16,
  },

  loginText: {
    fontSize: 12,
    color: "#64748B",
  },

  loginLink: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0072B5",
  },

  security: {
    marginTop: "auto",
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  securityText: {
    fontSize: 9,
    color: "#94A3B8",
  },

  /* Modal */

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },

  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
  },

  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D7DEE8",
    alignSelf: "center",
    marginBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalEyebrow: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#94A3B8",
    marginBottom: 3,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#273449",
  },

  modalDescription: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  statusList: {
    marginTop: 17,
    gap: 8,
  },

  statusOption: {
    minHeight: 55,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3E8EF",
    backgroundColor: "#FAFBFC",
    flexDirection: "row",
    alignItems: "center",
  },

  statusOptionSelected: {
    backgroundColor: "#F0F7FB",
    borderColor: "#C9E1EF",
  },

  statusIcon: {
    width: 33,
    height: 33,
    borderRadius: 10,
    backgroundColor: "#EEF1F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  statusIconSelected: {
    backgroundColor: "#E1F0F8",
  },

  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  statusTextSelected: {
    color: "#273449",
    fontWeight: "700",
  },

  modalCancel: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 5,
  },

  modalCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
});