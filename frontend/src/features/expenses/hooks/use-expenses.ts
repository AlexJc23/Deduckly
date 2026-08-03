import { useQuery } from "@tanstack/react-query";

import { getExpense } from "../api/expense-api";
import { Expense } from "../types/expense";

export function useExpenses(
  startDate: string,
  endDate: string,
  sort: "asc" | "desc" = "desc",
) {
  return useQuery<Expense[]>({
    queryKey: [
      "expenses",
      startDate,
      endDate,
      sort,
    ],
    queryFn: () =>
      getExpense(
        startDate,
        endDate,
        sort,
      ),
  });
}