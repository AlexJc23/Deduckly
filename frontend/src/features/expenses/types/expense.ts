export type ExpenseCategory =
  | "advertising"
  | "bank_fees"
  | "commissions_fees"
  | "contract_labor"
  | "education"
  | "equipment"
  | "office_supplies"
  | "software"
  | "phone"
  | "internet"
  | "vehicle"
  | "fuel"
  | "car_wash"
  | "vehicle_maintenance"
  | "vehicle_repairs"
  | "vehicle_insurance"
  | "vehicle_registration"
  | "parking_tolls"
  | "travel"
  | "lodging"
  | "airfare"
  | "meals"
  | "rent"
  | "utilities"
  | "insurance"
  | "licenses_permits"
  | "professional_services"
  | "taxes"
  | "payroll"
  | "other";

export interface ExpenseBase {
  amount: number | string;
  category: ExpenseCategory;
  incurred_at: string;

  merchant?: string | null;
  description?: string | null;

  business_percentage: number | string;

  receipt_url?: string | null;
}

export interface CreateExpense extends ExpenseBase {}

export interface UpdateExpense {
  amount?: number | string | null;
  category?: ExpenseCategory | null;
  incurred_at?: string | null;

  merchant?: string | null;
  description?: string | null;

  business_percentage?: number | string | null;

  receipt_url?: string | null;
}

export interface ExpenseResponse extends ExpenseBase {
  id: number;
  user_id: number;

  created_at: string;
  updated_at: string;
}

export type Expense = ExpenseResponse;