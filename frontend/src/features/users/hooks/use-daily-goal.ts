import { useQuery } from "@tanstack/react-query"
import { getDailyGoal } from "../api/get-daily-goal"

export function useDailyGoal() {
    return useQuery({
        queryKey: ["daily-goal"],
        queryFn: getDailyGoal,
    });
}