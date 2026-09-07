import { CurrentReport } from "../types/report.types";
import { ExpensePieChart } from "./ExpensePieChart";

export function ExpenseBreakdownCard({ report }: { report: CurrentReport }) {
  return <ExpensePieChart expenseBreakdown={report.expense_breakdown} />;
}
