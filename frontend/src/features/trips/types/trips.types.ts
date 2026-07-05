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


export type TripCreate = {
  start_time: string;
  end_time: string;

  distance_miles: number;

  start_lat: number;
  start_lng: number;

  end_lat: number;
  end_lng: number;

  start_address: string | null;
  end_address: string | null;

  category: string;

  platform: string | "PERSONAL";

  income_amount?: number | null;
};
