import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Text,
  View,
} from "react-native";

import { BackHeader } from "@/components/ui/BackButton";

import {
  ExpenseForm,
  ExpenseFormValues,
} from "@/features/expenses/components/ExpenseForm";

import { useExpenseDetail } from "@/features/expenses/hooks/use-expense-detail";
import { useUpdateExpense } from "@/features/expenses/hooks/use-update-expense";
import { uploadExpenseReceipt } from "@/features/expenses/api/expense-api";

export default function EditExpenseScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const expenseId = Number(id);

  const expenseQuery =
    useExpenseDetail(expenseId);

  const updateExpense =
    useUpdateExpense();

  if (expenseQuery.isPending) {
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

  if (
    expenseQuery.isError ||
    !expenseQuery.data
  ) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>
          Failed to load expense.
        </Text>
      </View>
    );
  }

  const expense =
    expenseQuery.data;

  async function handleSubmit(
    values: ExpenseFormValues,
    receiptUri: string | null,
  ) {
    try {
      await updateExpense.mutateAsync({
        expenseId,
        expense: {
          amount: Number(values.amount),
          category:
            values.category,
          merchant:
            values.merchant,
          description:
            values.description,
          business_percentage:
            Number(
              values.businessPercentage,
            ),
          incurred_at:
            values.incurredAt.toISOString(),
        },
      });

      if (
        receiptUri &&
        receiptUri !==
          expense.receipt_url
      ) {
        await uploadExpenseReceipt(
          expenseId,
          receiptUri,
        );
      }

      router.back();
    } catch {
      Alert.alert(
        "Error",
        "Unable to update expense.",
      );
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title:
            "Edit Expense",
        }}
      />

      <BackHeader />

      <ExpenseForm
        initialValues={{
          amount: String(
            expense.amount,
          ),
          category:
            expense.category,
          merchant:
            expense.merchant ??
            "",
          description:
            expense.description ??
            "",
          businessPercentage:
            String(
              expense.business_percentage,
            ),
          incurredAt: new Date(
            expense.incurred_at,
          ),
        }}
        initialReceiptUri={
          expense.receipt_url
        }
        submitLabel="Save Changes"
        loading={
          updateExpense.isPending
        }
        onSubmit={handleSubmit}
      />
    </>
  );
}