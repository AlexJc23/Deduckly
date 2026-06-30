import { useMutation } from "@tanstack/react-query";
import { deleteTrip } from "../api/trips.api";


export function useDeleteTrip() {
    return useMutation({
        mutationFn: deleteTrip
    });
}
