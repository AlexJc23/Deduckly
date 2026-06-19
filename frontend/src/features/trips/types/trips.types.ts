export interface Trip {
  id: number;
  user_id: number;

  start_time: string;
  end_time: string;

  distance_miles: string | null;
  income_amount: string | null;

  start_address: string | null;
  end_address: string | null;

  platform: string;
  category: string;

  purpose: string | null;

  deduction_amount: string | null;

  created_at: string;
  updated_at: string;
}
