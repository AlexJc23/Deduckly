import { Stack, router } from "expo-router";
import { Alert } from "react-native";

import { BackHeader } from "@/components/ui/BackButton";

import {
  ExpenseForm,
  ExpenseFormValues,
} from "@/features/expenses/components/ExpenseForm";

import { useCreateExpense } from "@/features/expenses/hooks/use-create-expense";

import { uploadExpenseReceipt } from "@/features/expenses/api/expense-api";

export default function CreateExpenseScreen() {
  const createExpense =
    useCreateExpense();

  async function handleSubmit(
    values: ExpenseFormValues,
    receiptUri: string | null,
  ) {
    try {
      const expense =
        await createExpense.mutateAsync({
          amount: Number(values.amount),
          category: values.category,
          merchant: values.merchant,
          description:
            values.description,
          business_percentage: Number(
            values.businessPercentage,
          ),
          incurred_at:
            values.incurredAt.toISOString(),
        });

      if (receiptUri) {
        await uploadExpenseReceipt(
          expense.id,
          receiptUri,
        );
      }

      router.back();
    } catch (error: any) {
  console.log(
    JSON.stringify(error.response?.data, null, 2)
  );

  Alert.alert(
    "Error",
    "Unable to create expense."
  );
}
  }

  return (
    <>
      <BackHeader />

      <Stack.Screen
        options={{
          title: "New Expense",
        }}
      />

      <ExpenseForm
        mode="create"
        loading={
          createExpense.isPending
        }
        submitLabel="Save Expense"
        initialValues={{
          amount: "",
          category: "fuel",
          merchant: "",
          description: "",
          businessPercentage:
            "100",
          incurredAt:
            new Date(),
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}