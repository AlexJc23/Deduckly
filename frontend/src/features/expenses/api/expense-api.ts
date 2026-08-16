import { api } from "@/api/client";
import {
  CreateExpense,
  UpdateExpense,
  Expense,
} from "../types/expense";

export async function getExpense(
  startDate?: string,
  endDate?: string,
  sort: "asc" | "desc" = "desc",
): Promise<Expense[]> {
  const response = await api.get<Expense[]>("/api/v1/expenses/", {
    params: {
      start_date: startDate,
      end_date: endDate,
      sort,
    },
  });

  return response.data;
}

export async function getExpenseById(
  expenseId: number,
): Promise<Expense> {
  const response = await api.get<Expense>(
    `/api/v1/expenses/${expenseId}`,
  );

  return response.data;
}

export async function createExpense(
  expense: CreateExpense,
): Promise<Expense> {
  const response = await api.post<Expense>(
    "/api/v1/expenses/",
    expense,
  );

  return response.data;
}

export async function updateExpense(
  expenseId: number,
  expense: UpdateExpense,
): Promise<Expense> {
  const response = await api.put<Expense>(
    `/api/v1/expenses/${expenseId}`,
    expense,
  );

  return response.data;
}

export async function deleteExpense(
  expenseId: number,
): Promise<{ detail: string }> {
  const response = await api.delete<{ detail: string }>(
    `/api/v1/expenses/${expenseId}`,
  );

  return response.data;
}

export async function uploadExpenseReceipt(
  expenseId: number,
  receiptUri: string,
): Promise<Expense> {
  const formData = new FormData();

  formData.append("file", {
    uri: receiptUri,
    name: "receipt.jpg",
    type: "image/jpeg",
  } as any);

  const response = await api.post<Expense>(
    `/api/v1/expenses/${expenseId}/receipt`,
    formData,
  );

  return response.data;
}