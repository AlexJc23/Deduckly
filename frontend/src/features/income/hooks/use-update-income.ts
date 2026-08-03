import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateIncome } from "../api/income-api";
import {
  Income,
  UpdateIncomeRequest,
} from "../types/income";

interface UpdateIncomeVariables {
  incomeId: number;
  income: UpdateIncomeRequest;
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation<
    Income,
    Error,
    UpdateIncomeVariables
  >({
    mutationFn: ({
      incomeId,
      income,
    }) =>
      updateIncome(
        incomeId,
        income,
      ),

    onSuccess: async (
      _,
      variables,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["income"],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "income",
            variables.incomeId,
          ],
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