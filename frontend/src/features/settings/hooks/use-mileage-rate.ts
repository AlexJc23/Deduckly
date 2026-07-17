import { useQuery } from "@tanstack/react-query"
import { getMileageRates } from "../api/mileage-rate.api"

export function useMileageRates() {
    return useQuery({
        queryKey: ["mileage-rates"],
        queryFn: getMileageRates,
    });
}