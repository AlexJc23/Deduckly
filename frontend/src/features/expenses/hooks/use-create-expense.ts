import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createExpense } from "../api/expense-api";

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,

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