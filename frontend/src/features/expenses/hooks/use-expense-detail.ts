import { useQuery } from "@tanstack/react-query";

import { getExpenseById } from "../api/expense-api";

export function useExpenseDetail(
  expenseId: number,
) {
  return useQuery({
    queryKey: [
      "expense",
      expenseId,
    ],
    queryFn: () =>
      getExpenseById(expenseId),
    enabled: !!expenseId,
  });
}