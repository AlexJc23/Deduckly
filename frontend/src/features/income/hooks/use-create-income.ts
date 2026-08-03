import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createIncome } from "../api/income-api";
import {
  CreateIncomeRequest,
  Income,
} from "../types/income";

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation<
    Income,
    Error,
    CreateIncomeRequest
  >({
    mutationFn: createIncome,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["income"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["monthly-goal"],
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