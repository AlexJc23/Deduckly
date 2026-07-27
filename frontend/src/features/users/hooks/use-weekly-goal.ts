import { useQuery } from "@tanstack/react-query"
import { getWeeklyGoal } from "../api/get-weekly-goal"

export function useWeeklyGoal() {
    return useQuery({
        queryKey: ["weekly-goal"],
        queryFn: getWeeklyGoal,
    });
}