import { useQuery } from "@tanstack/react-query";
import { getTrips, getTrip } from "../api/trips.api";



export function useTrips(){
    return useQuery({
        queryKey: ["trips"],
        queryFn: getTrips
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
