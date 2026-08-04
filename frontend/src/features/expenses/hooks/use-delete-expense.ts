import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteExpense } from "../api/expense-api";

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["expenses"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["report"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["today-report"],
        }),
      ]);
    },
  });
}