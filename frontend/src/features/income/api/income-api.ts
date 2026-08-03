import { api } from "@/api/client";
import {
  CreateIncomeRequest,
  Income,
  UpdateIncomeRequest,
} from "../types/income";

export async function getIncome(
  startDate?: string,
  endDate?: string,
  sort: "asc" | "desc" = "desc",
): Promise<Income[]> {
  const response = await api.get<Income[]>("/api/v1/income/", {
    params: {
      start_date: startDate,
      end_date: endDate,
      sort,
    },
  });

  return response.data;
}


export async function getIncomeById(
  incomeId: number,
): Promise<Income> {
  const response = await api.get<Income>(
    `/api/v1/income/${incomeId}`,
  );

  return response.data;
}

export async function createIncome(
  income: CreateIncomeRequest,
): Promise<Income> {
  const response = await api.post<Income>(
    "/api/v1/income/",
    income,
  );

  return response.data;
}

export async function updateIncome(
  incomeId: number,
  income: UpdateIncomeRequest,
): Promise<Income> {
  const response = await api.put<Income>(
    `/api/v1/income/${incomeId}`,
    income,
  );

  return response.data;
}

export async function deleteIncome(
  incomeId: number,
): Promise<{ detail: string }> {
  const response = await api.delete<{ detail: string }>(
    `/api/v1/income/${incomeId}`,
  );

  return response.data;
}