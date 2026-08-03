import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
  Animated,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUpdateUser } from "@/features/auth/hooks/use-update-user";
import DeleteAccountModal from "@/features/settings/modals/DeleteAccountModal";

import { clearTokens } from "@/features/auth/services/auth-service.service";
import { useDeleteUser } from "@/features/auth/hooks/use-delete-account";

import { useQueryClient } from "@tanstack/react-query";
import { BackHeader } from "@/components/ui/BackButton";

export default function UserUpdateScreen() {
  const userQuery = useCurrentUser();
  const updateUserMutation = useUpdateUser();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [filingStatus, setFilingStatus] = useState<string | null>(null);

  const [showFilingStatusModal, setShowFilingStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteUserMutation = useDeleteUser();

  const slideAnim = useRef(new Animated.Value(300)).current;

  const filingStatuses = [
    { label: "Single", value: "single" },
    { label: "Married Filing Jointly", value: "married_filing_jointly" },
    { label: "Married Filing Separately", value: "married_filing_separately" },
    { label: "Head of Household", value: "head_of_household" },
  ];

  useEffect(() => {
    if (!userQuery.data) return;

    setFirstName(userQuery.data.first_name);
    setLastName(userQuery.data.last_name);
    setFilingStatus(userQuery.data.filing_status);
  }, [userQuery.data]);

  useEffect(() => {
    if (showFilingStatusModal || showDeleteModal) {
      slideAnim.setValue(300);

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilingStatusModal, showDeleteModal]);

  if (userQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2DBE60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackHeader />

      <View style={styles.content}>
        <Text style={styles.title}>Account</Text>

        <Text style={styles.subtitle}>
          Update your personal information and filing status.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>First Name</Text>

          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Last Name</Text>

          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Filing Status</Text>

          <Pressable
            style={styles.selectButton}
            onPress={() => setShowFilingStatusModal(true)}
          >
            <Text style={styles.selectText}>
              {filingStatuses.find(
                status => status.value === filingStatus
              )?.label ?? "Select Filing Status"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.saveButton}
            onPress={async () => {
              await updateUserMutation.mutateAsync({
                first_name: firstName,
                last_name: lastName,
                filing_status: filingStatus,
              });
            }}
          >
            <Text style={styles.saveButtonText}>
              {updateUserMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Text style={styles.deleteButtonText}>
              Delete Account
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        animationType="none"
        visible={showFilingStatusModal}
        onRequestClose={() => setShowFilingStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.grabber} />

            <Text style={styles.sheetTitle}>
              Choose Filing Status
            </Text>

            {filingStatuses.map(status => (
              <Pressable
                key={status.value}
                style={styles.option}
                onPress={() => {
                  setFilingStatus(status.value);
                  setShowFilingStatusModal(false);
                }}
              >
                <Text style={styles.optionText}>
                  {status.label}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setShowFilingStatusModal(false)}
            >
              <Text style={styles.cancel}>
                Cancel
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={async () => {
          await deleteUserMutation.mutateAsync();

          await clearTokens();

          queryClient.clear();

          router.replace("/login");
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8FA",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 18,
  },

  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
  },

  selectButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  selectText: {
    fontSize: 16,
    color: "#111827",
  },

  saveButton: {
    marginTop: 30,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2DBE60",
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  deleteButton: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
  },

  grabber: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 18,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },

  option: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  optionText: {
    fontSize: 16,
    color: "#111827",
  },

  cancel: {
    textAlign: "center",
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 16,
    marginTop: 22,
  },
});