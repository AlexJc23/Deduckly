export interface ExpenseBreakdownItem {
  amount: number;
  count: number;
  business_percentage: number;
}

export interface CurrentReport {
  year: number;
  month: number;
  day: number | null;

  total_income: number;
  total_expenses: number;
  total_miles: number;

  mileage_deduction: number;
  deductible_expense_total: number;
  non_deductible_expense_total: number;
  total_deductions: number;

  net_profit: number;
  taxable_income: number;
  estimated_tax_owed: number;
  estimated_tax_savings: number;

  tax_method: string;
  business_type: string;

  largest_expense_category: string;
  largest_expense_amount: number;

  vehicle_expenses: number;

  expense_breakdown: Record<string, ExpenseBreakdownItem>;
}