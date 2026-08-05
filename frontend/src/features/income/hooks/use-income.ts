import { useQuery } from "@tanstack/react-query";

import { getIncome } from "../api/income-api";
import { Income } from "../types/income";

type SortOrder = "asc" | "desc";

export function useIncome(
  startDate: string,
  endDate: string,
  sort: SortOrder = "desc",
) {
  return useQuery<Income[]>({
    queryKey: [
      "income",
      startDate,
      endDate,
      sort,
    ],
    queryFn: () =>
      getIncome(
        startDate,
        endDate,
        sort,
      ),
  });
}