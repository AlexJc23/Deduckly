import { useQuery } from "@tanstack/react-query";

import { getIncomeById } from "../api/income-api";
import { Income } from "../types/income";

export function useIncomeDetail(
  incomeId: number,
) {
  return useQuery<Income>({
    queryKey: ["income", incomeId],
    queryFn: () => getIncomeById(incomeId),
    enabled: !!incomeId,
  });
}