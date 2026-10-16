import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTrip } from "../api/trips.api";

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: (_, id) => {
      for (const key of ['report', 'daily-goal', 'monthly-goal', 'income']) {
        void queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.removeQueries({ queryKey: ['trip', id], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["trips"],
      });
      queryClient.invalidateQueries({
        queryKey: ["today-report"],
      });
    },
  });
}