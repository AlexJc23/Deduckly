import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getReport } from "../api/reports.api";

export type UseCurrentReportParams = {
  vehicleId?: string;
  vehicleSummary?: boolean;
  method?: string;
  year?: number;
  month?: number;
  day?: number | null;
  startDate?: Date;
  endDate?: Date;
};

export function useCurrentReport(
  params: UseCurrentReportParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["report", params],
    enabled: options.enabled ?? true,
    queryFn: () => getReport(params),
    placeholderData: keepPreviousData,
  });
}