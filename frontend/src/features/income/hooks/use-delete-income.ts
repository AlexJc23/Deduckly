import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { deleteIncome } from "../api/income-api";
import { router } from "expo-router";



export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIncome,

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