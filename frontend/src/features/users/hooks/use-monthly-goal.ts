import { useQuery } from "@tanstack/react-query"
import { getMonthlyGoal } from "../api/get-monthly-goal"

export function useMonthlyGoal() {
    return useQuery({
        queryKey: ["monthly-goal"],
        queryFn: getMonthlyGoal,
    });
}