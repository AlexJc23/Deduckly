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

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });

      queryClient.invalidateQueries({
          queryKey: ["today-report"],
        }),
      queryClient.invalidateQueries({
          queryKey: ["report"],
        }),

      queryClient.invalidateQueries({
        queryKey: [
          "expense",
          variables.expenseId,
        ],
      });
    },
  });
}