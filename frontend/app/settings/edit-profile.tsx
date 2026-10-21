import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useLanguage, Translated } from "@/i18n/language";
import { Pressable, SafeAreaView, Text, TextInput, View, AnimatedView, ScrollView } from "@/theme/components";
import { ActivityIndicator, Animated, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUpdateUser } from "@/features/auth/hooks/use-update-user";
import { useDeleteUser } from "@/features/auth/hooks/use-delete-account";
import { clearTokens } from "@/features/auth/services/auth-service.service";
import DeleteAccountModal from "@/features/settings/modals/DeleteAccountModal";
import { Ionicons } from "@/theme/icons";

export default function UserUpdateScreen() {
  const { t } = useLanguage();
  const userQuery = useCurrentUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [filingStatus, setFilingStatus] =
    useState<string | null>(null);

  const [showFilingStatusModal, setShowFilingStatusModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const slideAnim = useRef(
    new Animated.Value(400)
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

  useEffect(() => {
    if (!userQuery.data) {
      return;
    }

    setFirstName(userQuery.data.first_name);
    setLastName(userQuery.data.last_name);
    setFilingStatus(userQuery.data.filing_status);
  }, [userQuery.data]);

  useEffect(() => {
    if (!showFilingStatusModal) {
      return;
    }

    slideAnim.setValue(400);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [
    showFilingStatusModal,
    slideAnim,
  ]);

  const selectedFilingStatus =
    filingStatuses.find(
      (status) =>
        status.value === filingStatus
    )?.label;

  const handleSave = async () => {
    Keyboard.dismiss();

    await updateUserMutation.mutateAsync({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      filing_status: filingStatus,
    });
  };

  const handleDelete = async () => {
    await deleteUserMutation.mutateAsync();

    await clearTokens();

    queryClient.clear();

    router.replace("/login");
  };

  if (userQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color="#0072B5"
        />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader title="Account" safeArea={false} />
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
          {/* Header */}

          <View style={styles.header}>
            <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Ionicons name="person-outline" size={28} color="#0072B5" />
            </View>
            <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              <Translated text={"Personal information"} /></Text>

            <Text style={styles.subtitle}>
              <Translated text={"Keep your account details and tax profile up to date."} /></Text>
            </View>
          </View>

          {/* Form */}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>
                  <Translated text={"Your information"} /></Text>
              </View>
            </View>

            {/* First Name */}

            <View style={styles.field}>
              <Text style={styles.label}>
                <Translated text={"First Name"} /></Text>

              <TextInput
                style={styles.input}
                accessibilityLabel={t('First Name')}
                textContentType="givenName"
                autoComplete="given-name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor="#A0AEC0"
                autoCapitalize="words"
              />
            </View>

            {/* Last Name */}

            <View style={styles.field}>
              <Text style={styles.label}>
                <Translated text={"Last Name"} /></Text>

              <TextInput
                style={styles.input}
                accessibilityLabel={t('Last Name')}
                textContentType="familyName"
                autoComplete="family-name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor="#A0AEC0"
                autoCapitalize="words"
              />
            </View>

            {/* Filing Status */}

            <View style={styles.field}>
              <Text style={styles.label}>
                <Translated text={"Filing Status"} /></Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t('Filing Status')}: ${t(selectedFilingStatus ?? 'Select Filing Status')}`}
                accessibilityState={{ expanded: showFilingStatusModal }}
                style={styles.selectButton}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowFilingStatusModal(true);
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    !selectedFilingStatus &&
                      styles.placeholderText,
                  ]}
                >
                  {t(selectedFilingStatus ?? "Select Filing Status")}
                </Text>

                <Text style={styles.chevron}>
                  ›
                </Text>
              </Pressable>
            </View>

            <Pressable accessibilityRole="button" style={styles.vehicleRow} onPress={() => router.push("/settings/vehicles")}>
              <View style={styles.vehicleIcon}><Ionicons name="car-outline" size={23} color="#0072B5" /></View>
              <View style={{ flex: 1 }}><Text style={styles.vehicleTitle}><Translated text="My Vehicles" /></Text><Text style={styles.vehicleSubtitle}>{t('Manage your saved vehicles.')}</Text></View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </Pressable>

            {/* Save */}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: updateUserMutation.isPending, busy: updateUserMutation.isPending }}
              style={[
                styles.saveButton,
                updateUserMutation.isPending &&
                  styles.buttonDisabled,
              ]}
              disabled={
                updateUserMutation.isPending
              }
              onPress={handleSave}
            >
              {updateUserMutation.isPending ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text style={styles.saveButtonText}>
                    <Translated text={"Saving..."} /></Text>
                </>
              ) : (
                <Text style={styles.saveButtonText}>
                  <Translated text={"Save Changes"} /></Text>
              )}
            </Pressable>

          </View>

          {/* Danger Zone */}

          <View style={styles.dangerCard}>
            <View style={styles.dangerHeader}>
              <View style={styles.dangerIcon}>
                <Ionicons name="trash-outline" size={19} color="#DC2626" />
              </View>

              <View style={styles.dangerContent}>
                <Text style={styles.dangerTitle}>
                  <Translated text={"Delete account"} /></Text>

                <Text style={styles.dangerDescription}>
                  <Translated text={"Permanently remove your account and associated data."} /></Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              style={styles.deleteButton}
              onPress={() =>
                setShowDeleteModal(true)
              }
            >
              <Text style={styles.deleteButtonText}>
                <Translated text={"Delete Account"} /></Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Filing Status Modal */}

        <Modal
          visible={showFilingStatusModal}
          transparent
          animationType="none"
          onRequestClose={() =>
            setShowFilingStatusModal(false)
          }
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() =>
                setShowFilingStatusModal(false)
              }
            />

            <AnimatedView
              style={[
                styles.bottomSheet,
                {
                  transform: [
                    {
                      translateY: slideAnim,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.grabber} />

              <Text style={styles.sheetEyebrow}>
                <Translated text={"TAX PROFILE"} /></Text>

              <Text style={styles.sheetTitle}>
                <Translated text={"Filing Status"} /></Text>

              <Text style={styles.sheetSubtitle}>
                <Translated text={"Select the status that applies to your tax return."} /></Text>

              <ScrollView style={styles.optionList} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
                {filingStatuses.map(
                  (status) => {
                    const selected =
                      status.value ===
                      filingStatus;

                    return (
                      <Pressable
                        key={status.value}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        style={[
                          styles.option,
                          selected &&
                            styles.optionSelected,
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
                            styles.optionIndicator,
                            selected &&
                              styles.optionIndicatorSelected,
                          ]}
                        >
                          {selected && (
                            <Text
                              style={
                                styles.checkmark
                              }
                            >
                              ✓
                            </Text>
                          )}
                        </View>

                        <Text
                          style={[
                            styles.optionText,
                            selected &&
                              styles.optionTextSelected,
                          ]}
                        >
                          {t(status.label)}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </ScrollView>

              <Pressable
                accessibilityRole="button"
                style={styles.cancelButton}
                onPress={() =>
                  setShowFilingStatusModal(
                    false
                  )
                }
              >
                <Text style={styles.cancelText}>
                  <Translated text={"Cancel"} /></Text>
              </Pressable>
            </AnimatedView>
          </View>
        </Modal>

        {/* Delete Modal */}

        <DeleteAccountModal
          visible={showDeleteModal}
          onClose={() =>
            setShowDeleteModal(false)
          }
          onDelete={handleDelete}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  safeArea: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  content: {
    width: '100%', maxWidth: 640, alignSelf: 'center',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28,
  },
  navigation: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  navigationTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E8EEFF', alignItems: 'center', justifyContent: 'center' },
  vehicleRow: { marginTop: 20, padding: 14, borderRadius: 14, backgroundColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  vehicleTitle: { fontSize: 16, fontWeight: '700', color: '#273449' },
  vehicleSubtitle: { fontSize: 13, lineHeight: 19, color: '#64748B', marginTop: 3 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },



  title: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#273449",
  },

  subtitle: {
    maxWidth: 350,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3E8EF",
    padding: 18,
  },

  cardHeader: {
    marginBottom: 4,
  },



  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#273449",
  },

  field: {
    marginTop: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 7,
  },

  input: {
    minHeight: 52,
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FBFCFD",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#273449",
  },

  selectButton: {
    minHeight: 52,
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FBFCFD",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#273449",
  },

  placeholderText: {
    color: "#A0AEC0",
    fontWeight: "400",
  },

  chevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#94A3B8",
  },

  saveButton: {
    minHeight: 54,
    paddingVertical: 14,
    marginTop: 22,
    borderRadius: 14,
    backgroundColor: "#4A6FE3",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,

    shadowColor: "#0072B5",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  dangerCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },

  dangerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  dangerIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },



  dangerContent: {
    flex: 1,
  },

  dangerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#273449",
  },

  dangerDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#7F8A9A",
  },

  deleteButton: {
    minHeight: 48,
    paddingVertical: 12,
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7BABA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  deleteButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },

  bottomSheet: {
    width: '100%', maxWidth: 640, maxHeight: '85%', alignSelf: 'center',
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
  },

  grabber: {
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D7DEE8",
    alignSelf: "center",
    marginBottom: 20,
  },

  sheetEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#94A3B8",
    marginBottom: 3,
  },

  sheetTitle: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#273449",
  },

  sheetSubtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  optionList: {
    marginTop: 17,
    gap: 8,
  },

  option: {
    minHeight: 53,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3E8EF",
    backgroundColor: "#FAFBFC",
    flexDirection: "row",
    alignItems: "center",
  },

  optionSelected: {
    backgroundColor: "#F0F7FB",
    borderColor: "#C9E1EF",
  },

  optionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#EEF1F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  optionIndicatorSelected: {
    backgroundColor: "#DCEEF7",
  },

  checkmark: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0072B5",
  },

  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },

  optionTextSelected: {
    color: "#273449",
    fontWeight: "700",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 5,
  },

  cancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
});
