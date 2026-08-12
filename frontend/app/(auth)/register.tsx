import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
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

import { register } from "@/features/auth/api/auth.api";

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

  /*
   * Keep the comparison simple.
   *
   * Passwords should match exactly.
   * We do NOT trim passwords because whitespace can
   * technically be part of a password.
   */
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const hasPasswordMismatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const registerMutation = useMutation({
    mutationFn: register,

    onSuccess: () => {
  console.log("REGISTER SUCCESS");
  console.log("EMAIL:", email.trim());

  router.replace("/(auth)/verify-email");
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

    Animated.timing(
      modalTranslateY,
      {
        toValue: 0,
        duration: 280,
        easing: Easing.out(
          Easing.cubic
        ),
        useNativeDriver: true,
      }
    ).start();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <Pressable
          style={styles.keyboardDismissArea}
          onPress={Keyboard.dismiss}
        >
          <View style={styles.container}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color="#273449"
              />

              <Text style={styles.backText}>
                Back
              </Text>
            </Pressable>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={
                styles.scrollContent
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
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
                    GET STARTED
                  </Text>

                  <Text style={styles.title}>
                    Create your account
                  </Text>

                  <Text style={styles.subtitle}>
                    Start tracking your miles,
                    expenses, and income with
                    Deduckly.
                  </Text>
                </View>

                <View style={styles.form}>
                  {/* First + Last Name */}

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <Text style={styles.label}>
                        First name
                      </Text>

                      <TextInput
                        value={firstName}
                        onChangeText={
                          setFirstName
                        }
                        placeholder="First name"
                        placeholderTextColor="#A0AEC0"
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={
                          !registerMutation.isPending
                        }
                        returnKeyType="next"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.halfField}>
                      <Text style={styles.label}>
                        Last name
                      </Text>

                      <TextInput
                        value={lastName}
                        onChangeText={
                          setLastName
                        }
                        placeholder="Last name"
                        placeholderTextColor="#A0AEC0"
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={
                          !registerMutation.isPending
                        }
                        returnKeyType="next"
                        style={styles.input}
                      />
                    </View>
                  </View>

                  {/* Email */}

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Email
                    </Text>

                    <View
                      style={
                        styles.inputContainer
                      }
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
                        editable={
                          !registerMutation.isPending
                        }
                        returnKeyType="next"
                        style={
                          styles.inputWithIcon
                        }
                      />
                    </View>
                  </View>

                  {/* Password */}

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Password
                    </Text>

                    <View
                      style={
                        styles.inputContainer
                      }
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
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        editable={
                          !registerMutation.isPending
                        }
                        returnKeyType="next"
                        style={
                          styles.inputWithIcon
                        }
                      />
                    </View>
                  </View>

                  {/* Confirm Password */}

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Confirm password
                    </Text>

                    <View
                      style={[
                        styles.inputContainer,
                        hasPasswordMismatch &&
                          styles.inputError,
                        passwordsMatch &&
                          styles.inputSuccess,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={
                          passwordsMatch
                            ? "#16A34A"
                            : "#94A3B8"
                        }
                      />

                      <TextInput
                        value={confirmPassword}
                        onChangeText={
                          setConfirmPassword
                        }
                        placeholder="Confirm password"
                        placeholderTextColor="#A0AEC0"
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        editable={
                          !registerMutation.isPending
                        }
                        returnKeyType="done"
                        onSubmitEditing={
                          handleRegister
                        }
                        style={
                          styles.inputWithIcon
                        }
                      />

                      {passwordsMatch && (
                        <Ionicons
                          name="checkmark-circle"
                          size={19}
                          color="#16A34A"
                        />
                      )}
                    </View>

                    {hasPasswordMismatch && (
                      <Text
                        style={
                          styles.validationText
                        }
                      >
                        Passwords do not match.
                      </Text>
                    )}

                    {passwordsMatch && (
                      <Text
                        style={
                          styles.successText
                        }
                      >
                        Passwords match.
                      </Text>
                    )}
                  </View>

                  {/* Filing Status */}

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Filing status
                    </Text>

                    <Pressable
                      disabled={
                        registerMutation.isPending
                      }
                      style={
                        styles.inputContainer
                      }
                      onPress={() =>
                        setShowFilingStatusModal(
                          true
                        )
                      }
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color="#94A3B8"
                      />

                      <Text
                        style={[
                          styles.filingStatusText,
                          !filingStatus &&
                            styles.placeholder,
                        ]}
                      >
                        {filingStatus
                          ? filingStatuses.find(
                              (item) =>
                                item.value ===
                                filingStatus
                            )?.label
                          : "Select filing status"}
                      </Text>

                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color="#94A3B8"
                      />
                    </Pressable>
                  </View>

                  {/* Error */}

                  {registerMutation.isError && (
                    <View
                      style={
                        styles.errorContainer
                      }
                    >
                      <Ionicons
                        name="alert-circle-outline"
                        size={17}
                        color="#DC2626"
                      />

                      <Text
                        style={styles.errorText}
                      >
                        Unable to create your
                        account. Please check
                        your information and try
                        again.
                      </Text>
                    </View>
                  )}

                  {/* Register */}

                  <Pressable
                    disabled={isDisabled}
                    style={[
                      styles.button,
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

                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          Creating Account...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
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

                  {/* Sign In */}

                  <View style={styles.loginRow}>
                    <Text
                      style={styles.loginText}
                    >
                      Already have an account?
                    </Text>

                    <Link
                      href="/(auth)/login"
                      asChild
                    >
                      <Pressable>
                        <Text
                          style={
                            styles.loginLink
                          }
                        >
                          Sign in
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              </View>
            </ScrollView>

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

            {/* Filing Status Modal */}

            <Modal
              visible={showFilingStatusModal}
              transparent
              animationType="none"
              onRequestClose={() =>
                setShowFilingStatusModal(false)
              }
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() =>
                  setShowFilingStatusModal(
                    false
                  )
                }
              >
                <Animated.View
                  style={[
                    styles.modalContent,
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
                  <Pressable
                    onPress={(event) =>
                      event.stopPropagation()
                    }
                  >
                    <View
                      style={
                        styles.modalHeader
                      }
                    >
                      <View>
                        <Text
                          style={
                            styles.modalTitle
                          }
                        >
                          Filing status
                        </Text>

                        <Text
                          style={
                            styles.modalSubtitle
                          }
                        >
                          Choose the status you
                          expect to use.
                        </Text>
                      </View>

                      <Pressable
                        onPress={() =>
                          setShowFilingStatusModal(
                            false
                          )
                        }
                        style={
                          styles.modalClose
                        }
                      >
                        <Ionicons
                          name="close"
                          size={20}
                          color="#475569"
                        />
                      </Pressable>
                    </View>

                    <View
                      style={
                        styles.modalOptions
                      }
                    >
                      {filingStatuses.map(
                        (item) => (
                          <Pressable
                            key={item.value}
                            style={[
                              styles.modalOption,
                              filingStatus ===
                                item.value &&
                                styles.modalOptionSelected,
                            ]}
                            onPress={() => {
                              setFilingStatus(
                                item.value
                              );

                              setShowFilingStatusModal(
                                false
                              );
                            }}
                          >
                            <Text
                              style={[
                                styles.modalOptionText,
                                filingStatus ===
                                  item.value &&
                                  styles.modalOptionTextSelected,
                              ]}
                            >
                              {item.label}
                            </Text>

                            {filingStatus ===
                              item.value && (
                              <Ionicons
                                name="checkmark"
                                size={19}
                                color="#0072B5"
                              />
                            )}
                          </Pressable>
                        )
                      )}
                    </View>
                  </Pressable>
                </Animated.View>
              </Pressable>
            </Modal>
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

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
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

  inputWithIcon: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 15,
    color: "#273449",
    textAlignVertical: "center",
  },

  filingStatusText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#273449",
    textAlign: "center",
  },

  placeholder: {
    color: "#A0AEC0",
  },

  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF8F8",
  },

  inputSuccess: {
    borderColor: "#86EFAC",
    backgroundColor: "#F7FFF9",
  },

  validationText: {
    marginTop: 6,
    fontSize: 11,
    color: "#B91C1C",
  },

  successText: {
    marginTop: 6,
    fontSize: 11,
    color: "#15803D",
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

  securityText: {
    fontSize: 10,
    color: "#94A3B8",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(15, 23, 42, 0.35)",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 34,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#273449",
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  modalOptions: {
    gap: 8,
  },

  modalOption: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  modalOptionSelected: {
    borderColor: "#0072B5",
    backgroundColor: "#F0F8FD",
  },

  modalOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  modalOptionTextSelected: {
    fontWeight: "800",
    color: "#0072B5",
  },
});