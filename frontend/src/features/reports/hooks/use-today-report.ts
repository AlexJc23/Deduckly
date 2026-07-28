import { useQuery } from "@tanstack/react-query"
import { getTodayReport } from "../api/reports.api"


export function useTodayReport() {
    return useQuery({
        queryKey: ["today-report"],
        queryFn: getTodayReport
    });
}