import { useQuery } from "@tanstack/react-query";
import { getTrips, getTrip } from "../api/trips.api";



export function useTrips(
  startDate?: string,
  endDate?: string,
  sort: "asc" | "desc" = "desc"
) {
  return useQuery({
    queryKey: [
      "trips",
      startDate,
      endDate,
      sort,
    ],
    queryFn: () =>
      getTrips(
        startDate,
        endDate,
        sort
      ),
  });
}

 export function useTrip(
    id: number
 ) {
    return useQuery({
        queryKey: ["trip", id],
        queryFn: () => getTrip(id)
    });
 }
