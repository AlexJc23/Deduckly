import {
  Stack,
  useLocalSearchParams,
  router,
} from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { useDeleteExpense } from "@/features/expenses/hooks/use-delete-expense";
import { useExpenseDetail } from "@/features/expenses/hooks/use-expense-detail";
import { DeleteExpenseModal } from "@/features/expenses/modals/DeleteExpenseModal";
import { EXPENSE_CATEGORY_LABELS } from "@/constants/expense-category-labels";
import { BackHeader } from "@/components/ui/BackButton";

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const expenseId = Number(id);

  const expenseQuery =
    useExpenseDetail(expenseId);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const deleteMutation = useDeleteExpense();

  useFocusEffect(
    useCallback(() => {
      expenseQuery.refetch();
    }, [expenseQuery]),
  );

  if (expenseQuery.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (
    expenseQuery.isError ||
    !expenseQuery.data
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Failed to load expense.
        </Text>
      </View>
    );
  }

  const expense = expenseQuery.data;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Expense Details",
          headerShown: false,
        }}
      />
      <BackHeader />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            EXPENSE
          </Text>

          <Text style={styles.title}>
            Expense Details
          </Text>

          <Text style={styles.subtitle}>
            Review the details of this expense.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>
              Amount
            </Text>

            <Text style={styles.amount}>
              $
              {Number(expense.amount).toFixed(
                2,
              )}
            </Text>
          </View>

          <View style={styles.divider} />

          <DetailRow
            label="Date"
            value={new Date(
              expense.incurred_at,
            ).toLocaleDateString()}
          />

          <DetailRow
            label="Category"
            value={
              EXPENSE_CATEGORY_LABELS[
                expense.category
              ]
            }
          />

          <DetailRow
            label="Merchant"
            value={
              expense.merchant ??
              "Not provided"
            }
          />

          <DetailRow
            label="Description"
            value={
              expense.description ??
              "Not provided"
            }
          />

          <DetailRow
            label="Business Percentage"
            value={`${expense.business_percentage}%`}
          />
        </View>

        <View style={styles.receiptCard}>
          <Text style={styles.sectionTitle}>
            Receipt
          </Text>

          {expense.receipt_url ? (
            <Image
              source={{
                uri: expense.receipt_url,
              }}
              style={styles.receiptImage}
            />
          ) : (
            <View style={styles.noReceipt}>
              <Text
                style={
                  styles.noReceiptText
                }
              >
                No receipt attached
              </Text>
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            pressed &&
              styles.editButtonPressed,
          ]}
          onPress={() =>
            router.push(
              `/expense/${expense.id}/edit`,
            )
          }
        >
          <Text style={styles.editButtonText}>
            Edit Expense
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed &&
              styles.deleteButtonPressed,
          ]}
          onPress={() =>
            setShowDeleteModal(true)
          }
        >
          <Text style={styles.deleteButtonText}>
            Delete Expense
          </Text>
        </Pressable>

        <DeleteExpenseModal
          visible={showDeleteModal}
          onClose={() =>
            setShowDeleteModal(false)
          }
          onDelete={() => {
            deleteMutation.mutate(
              expense.id,
              {
                onSuccess: () => {
                  setShowDeleteModal(false);
                  router.back();
                },
              },
            );
          }}
        />
      </ScrollView>
    </>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  errorText: {
    fontSize: 15,
    color: "#64748B",
  },

  container: {
    padding: 20,
    paddingBottom: 48,
  },

  header: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#64748B",
    marginBottom: 4,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
  },

  amountSection: {
    paddingVertical: 4,
  },

  amountLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 5,
  },

  amount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 6,
  },

  row: {
    paddingVertical: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    lineHeight: 21,
    color: "#111827",
    fontWeight: "600",
  },

  receiptCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  receiptImage: {
    width: "100%",
    height: 240,
    borderRadius: 13,
    resizeMode: "cover",
  },

  noReceipt: {
    height: 90,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  noReceiptText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },

  editButton: {
    minHeight: 52,
    marginTop: 18,
    backgroundColor: "#4A6FE3",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  editButtonPressed: {
    backgroundColor: "#3559C7",
    transform: [{ scale: 0.985 }],
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  deleteButton: {
    minHeight: 50,
    marginTop: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonPressed: {
    backgroundColor: "#FEE2E2",
    transform: [{ scale: 0.985 }],
  },

  deleteButtonText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "700",
  },
});