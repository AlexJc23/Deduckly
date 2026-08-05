import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useIncomeDetail } from "@/features/income/hooks/use-income-detail";
import { BackHeader } from "@/components/ui/BackButton";
import { PLATFORM_LABELS, SOURCE_LABELS } from "@/constants/platform-labels";
import { useState } from "react";
import { DeleteIncomeModal } from "@/features/income/components/DeleteIncomeModal";
import { useDeleteIncome } from "@/features/income/hooks/use-delete-income";

export default function IncomeDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteMutation = useDeleteIncome();
  const incomeQuery = useIncomeDetail(Number(id));

  if (incomeQuery.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (incomeQuery.isError || !incomeQuery.data) {
    return (
      <View style={styles.center}>
        <Text>Failed to load income.</Text>
      </View>
    );
  }

  const income = incomeQuery.data;

  const platformLabel = income.platform
    ? PLATFORM_LABELS[
        income.platform as keyof typeof PLATFORM_LABELS
      ] ?? "Other"
    : income.source ?? "Unknown";

  const sourceLabel = income.source
    ? SOURCE_LABELS[
        income.source as keyof typeof SOURCE_LABELS
      ] ?? "Other"
    : income.source ?? "Unknown";

  return (
    <>
      <Stack.Screen
        options={{
          title: "Income Details",
        }}
      />
      <BackHeader />

      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.label}>
            Amount
          </Text>

          <Text style={styles.value}>
            ${Number(income.amount).toFixed(2)}
          </Text>

          <Text style={styles.label}>
            Source
          </Text>

          <Text style={styles.value}>
            {sourceLabel}
          </Text>

          {income.platform && (
            <>
              <Text style={styles.label}>
                Platform
              </Text>

              <Text style={styles.value}>
                {platformLabel}
              </Text>
            </>
          )}

          {income.business_name && (
            <>
              <Text style={styles.label}>
                Business
              </Text>

              <Text style={styles.value}>
                {income.business_name}
              </Text>
            </>
          )}

          <Text style={styles.label}>
            Received
          </Text>

          <Text style={styles.value}>
            {new Date(
              income.received_at ??
                income.created_at,
            ).toLocaleString()}
          </Text>

          {income.notes && (
            <>
              <Text style={styles.label}>
                Notes
              </Text>

              <Text style={styles.value}>
                {income.notes}
              </Text>
            </>
          )}
        </View>

        <Pressable
          style={styles.button}
          onPress={() =>
            router.push(
              `/income/${income.id}/edit`,
            )
          }
        >
          <Text style={styles.buttonText}>
            Edit Income
          </Text>
        </Pressable>
         <Pressable
          style={styles.deleteButton}
          onPress={() =>
            setShowDeleteModal(true)
          }
        >
          <Text style={styles.deleteText}>
            Delete Income
          </Text>
        </Pressable>
        <DeleteIncomeModal
          visible={showDeleteModal}
          onClose={() =>
            setShowDeleteModal(false)
          }
          onDelete={async () => {
            setShowDeleteModal(false);
            router.back();

            await deleteMutation.mutateAsync(
              income.id,
            );
          }}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
    marginTop: 18,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  value: {
    fontSize: 17,
    color: "#111827",
  },
  button: {
    marginTop: 24,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  deleteText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "700",
  },
});