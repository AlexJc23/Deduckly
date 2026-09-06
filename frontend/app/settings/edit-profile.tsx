import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUpdateUser } from "@/features/auth/hooks/use-update-user";
import { useDeleteUser } from "@/features/auth/hooks/use-delete-account";
import { clearTokens } from "@/features/auth/services/auth-service.service";
import DeleteAccountModal from "@/features/settings/modals/DeleteAccountModal";
import { BackHeader } from "@/components/ui/BackButton";

export default function UserUpdateScreen() {
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
    <View style={styles.screen}>
        <BackHeader />
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.content}>
          {/* Header */}

          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              ACCOUNT
            </Text>

            <Text style={styles.title}>
              Personal information
            </Text>

            <Text style={styles.subtitle}>
              Keep your account details and tax
              profile up to date.
            </Text>
          </View>

          {/* Form */}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardEyebrow}>
                  PROFILE
                </Text>

                <Text style={styles.cardTitle}>
                  Your information
                </Text>
              </View>
            </View>

            {/* First Name */}

            <View style={styles.field}>
              <Text style={styles.label}>
                First Name
              </Text>

              <TextInput
                style={styles.input}
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
                Last Name
              </Text>

              <TextInput
                style={styles.input}
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
                Filing Status
              </Text>

              <Pressable
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
                  {selectedFilingStatus ??
                    "Select Filing Status"}
                </Text>

                <Text style={styles.chevron}>
                  ›
                </Text>
              </Pressable>
            </View>

            {/* Save */}

            <Pressable
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
                    Saving...
                  </Text>
                </>
              ) : (
                <Text style={styles.saveButtonText}>
                  Save Changes
                </Text>
              )}
            </Pressable>
          </View>

          {/* Danger Zone */}

          <View style={styles.dangerCard}>
            <View style={styles.dangerHeader}>
              <View style={styles.dangerIcon}>
                <Text style={styles.dangerIconText}>
                  !
                </Text>
              </View>

              <View style={styles.dangerContent}>
                <Text style={styles.dangerTitle}>
                  Delete account
                </Text>

                <Text style={styles.dangerDescription}>
                  Permanently remove your account
                  and associated data.
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.deleteButton}
              onPress={() =>
                setShowDeleteModal(true)
              }
            >
              <Text style={styles.deleteButtonText}>
                Delete Account
              </Text>
            </Pressable>
          </View>
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
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() =>
                setShowFilingStatusModal(false)
              }
            />

            <Animated.View
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
                TAX PROFILE
              </Text>

              <Text style={styles.sheetTitle}>
                Filing Status
              </Text>

              <Text style={styles.sheetSubtitle}>
                Select the status that applies to
                your tax return.
              </Text>

              <View style={styles.optionList}>
                {filingStatuses.map(
                  (status) => {
                    const selected =
                      status.value ===
                      filingStatus;

                    return (
                      <Pressable
                        key={status.value}
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
                          {status.label}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </View>

              <Pressable
                style={styles.cancelButton}
                onPress={() =>
                  setShowFilingStatusModal(
                    false
                  )
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>
            </Animated.View>
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  header: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#94A3B8",
    marginBottom: 4,
  },

  title: {
    fontSize: 27,
    lineHeight: 32,
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

  cardEyebrow: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#94A3B8",
    marginBottom: 3,
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
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDE4ED",
    backgroundColor: "#FBFCFD",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#273449",
  },

  selectButton: {
    height: 50,
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
    height: 51,
    marginTop: 22,
    borderRadius: 14,
    backgroundColor: "#0072B5",
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
    fontSize: 14,
    fontWeight: "800",
  },

  dangerCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F1D7D7",
    backgroundColor: "#FFF9F9",
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

  dangerIconText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#DC2626",
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
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: "#7F8A9A",
  },

  deleteButton: {
    height: 43,
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
    fontSize: 8,
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
    fontSize: 13,
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