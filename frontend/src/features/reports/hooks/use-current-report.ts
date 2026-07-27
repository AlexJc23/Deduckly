import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getReport } from "../api/reports.api";

export type UseCurrentReportParams = {
  year?: number;
  month?: number;
  day?: number;
  startDate?: Date;
  endDate?: Date;
};

export function useCurrentReport(
  params: UseCurrentReportParams
) {
  return useQuery({
    queryKey: ["report", params],
    queryFn: () => getReport(params),
    placeholderData: keepPreviousData,
  });
}