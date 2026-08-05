import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTrip } from "../api/trips.api";

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["trips"],
      });
    },
  });
}