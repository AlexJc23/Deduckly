import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTrip } from "../api/trips.api";
import { TripUpdate } from "../types/trips.types";

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripId,
      trip,
    }: {
      tripId: number;
      trip: TripUpdate;
    }) => updateTrip(tripId, trip),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trip", variables.tripId],
      });

      queryClient.invalidateQueries({
        queryKey: ["trips"],
      });
    },
  });
}
