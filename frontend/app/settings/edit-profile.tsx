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

  const [showDeleteModal, setShowDeleteModal] =
  useState(false);
  
  const deleteUserMutation = useDeleteUser();

  const [error, setError] = useState<string | null>(null);

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
    if (showFilingStatusModal) {
      slideAnim.setValue(300);

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilingStatusModal]);

  useEffect(() => {
    if (showDeleteModal) {
      slideAnim.setValue(300);

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showDeleteModal]);

  if (userQuery.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View>
      <BackHeader />
    
    <View style={{ flex: 1, padding: 20, margin: "auto", marginTop: 40,justifyContent: "center" }}>
      <Text>First Name</Text>
      <TextInput value={firstName} onChangeText={setFirstName} />

      <Text>Last Name</Text>
      <TextInput value={lastName} onChangeText={setLastName} />

      <Text>Filing Status</Text>
      <Pressable onPress={() => setShowFilingStatusModal(true)}>
        <Text>{filingStatus || "Select Filing Status"}</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          await updateUserMutation.mutateAsync({
            first_name: firstName,
            last_name: lastName,
            filing_status: filingStatus,
          });

          router.back();
        }}
      >
        <Text>Update</Text>
      </Pressable>
      <Pressable
        onPress={() => {
            setShowDeleteModal(true);
        }}
      >
        <Text>Delete Account</Text>
      </Pressable>

      <Modal
        transparent
        animationType="none"
        visible={showFilingStatusModal}
        onRequestClose={() => setShowFilingStatusModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.28)",
          }}
        >
          <Animated.View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={{
                width: 40,
                height: 5,
                borderRadius: 3,
                backgroundColor: "#D1D1D6",
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 16,
              }}
            >
              Choose Filing Status
            </Text>

            {filingStatuses.map((status) => (
              <Pressable
                key={status.value}
                style={{ paddingVertical: 12 }}
                onPress={() => {
                  setFilingStatus(status.value);
                  setShowFilingStatusModal(false);
                }}
              >
                <Text>{status.label}</Text>
              </Pressable>
            ))}

            <Pressable onPress={() => setShowFilingStatusModal(false)}>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
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
    </View>
  );
}