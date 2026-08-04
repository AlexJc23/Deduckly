import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UpdateExpense } from "../types/expense";
import { updateExpense } from "../api/expense-api";

type UpdateExpenseParams = {
  expenseId: number;
  expense: UpdateExpense;
};

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseId,
      expense,
    }: UpdateExpenseParams) =>
      updateExpense(
        expenseId,
        expense,
      ),

    onSuccess: async (
      updatedExpense,
      variables,
    ) => {
      // Update the expense detail cache immediately.
      queryClient.setQueryData(
        ["expense", variables.expenseId],
        updatedExpense,
      );

      // Refresh all affected queries.
      await queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["today-report"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["report"],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "expense",
          variables.expenseId,
        ],
      });
    },
  });
}