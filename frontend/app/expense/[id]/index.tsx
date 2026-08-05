import { Stack, useLocalSearchParams, router } from "expo-router";
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
import {
  useExpenseDetail,
} from "@/features/expenses/hooks/use-expense-detail";
import { DeleteExpenseModal } from "@/features/expenses/modals/DeleteExpenseModal";
import { EXPENSE_CATEGORY_LABELS } from "@/constants/expense-category-labels";
import { BackHeader } from "@/components/ui/BackButton";

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const expenseId = Number(id);

  const expenseQuery = useExpenseDetail(expenseId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteMutation = useDeleteExpense();
  

  useFocusEffect(
    useCallback(() => {
      expenseQuery.refetch();
    }, [expenseQuery])
  );

  if (expenseQuery.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (expenseQuery.isError || !expenseQuery.data) {
    return (
      <View style={styles.center}>
        <Text>Failed to load expense.</Text>
      </View>
    );
  }

  const expense = expenseQuery.data;

  return (
    <>
      <BackHeader />
      <Stack.Screen
        options={{
          title: "Expense Details",
        }}
      />

      <ScrollView
        contentContainerStyle={styles.container}
      >
        <DetailRow
          label="Date"
          value={new Date(
            expense.incurred_at,
          ).toLocaleDateString()}
        />

        <DetailRow
          label="Amount"
          value={`$${Number(expense.amount).toFixed(2)}`}
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
            expense.merchant ?? "Not provided"
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

        <Text style={styles.label}>
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
          <Text style={styles.value}>
            Not provided
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push(
                `/expense/${expense.id}/edit`
              )
            }
          >
            <Text style={styles.buttonText}>
              Edit Expense
            </Text>
          </Pressable>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.editButton,
              { backgroundColor: "#DC2626" },
            ]}
            onPress={() =>
              setShowDeleteModal(true)
            }
          >
            <Text style={styles.buttonText}>
              Delete Expense
            </Text>
          </Pressable>

        </View>
        <DeleteExpenseModal
          visible={showDeleteModal}
          onClose={() =>
            setShowDeleteModal(false)
          }
          onDelete={() => {
            deleteMutation.mutate(expense.id, {
              onSuccess: () => {
                setShowDeleteModal(false);
                router.back();
              },
            });
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    padding: 20,
    gap: 20,
  },

  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },

  value: {
    fontSize: 17,
    color: "#111827",
    fontWeight: "600",
  },

  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },

  receiptImage: {
    width: "100%",
    height: 240,
    borderRadius: 9,
    marginTop: 8,
  },

  editButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});