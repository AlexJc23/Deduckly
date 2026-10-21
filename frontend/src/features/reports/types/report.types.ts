export interface ExpenseBreakdownItem {
  amount: number;
  count: number;
  business_percentage: number;
}

export interface CurrentReport {
  report_version?:2;
  start_date?:string;end_date?:string;vehicle_filter?:string|null;report_fingerprint?:string;
  personal_miles?:number;parking_tolls?:number;non_vehicle_deductions?:number;
  comparison_standard?:number;comparison_actual?:number|null;calculation_complete?:boolean;
  caveats?:string[];advanced?:boolean;
  vehicle_rows?:{vehicle_id:string|null;vehicle_name:string;business_miles?:number;personal_miles?:number;method:string;business_use_percentage?:number|null;standard?:number;actual?:number|null;eligibility:string}[];
  trends?:{period:string;income:number;expenses:number}[];
  rate_periods?:{rate:string;miles:number;deduction:number;effective_start:string;effective_end:string}[];
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
  estimated_tax_owed: number | null;
  estimated_tax_savings: number | null;

  tax_method: string;
  business_type: string;

  largest_expense_category: string;
  largest_expense_amount: number;

  vehicle_expenses: number;

  expense_breakdown: Record<string, ExpenseBreakdownItem>;
}