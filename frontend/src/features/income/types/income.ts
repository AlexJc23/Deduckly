export type IncomeType =
  | "gig_platform"
  | "business"
  | "employment"
  | "passive"
  | "other";


export type TripPlatform =
  | "uber"
  | "uber_eats"
  | "lyft"
  | "doordash"
  | "grubhub"
  | "instacart"
  | "spark"
  | "amazon_flex"
  | "shipt"
  | "other";

export interface Income {
  id: number;
  user_id: number;

  amount: number;

  source: IncomeType;

  platform: TripPlatform | null;

  business_name: string | null;

  received_at: string | null;

  notes: string | null;

  created_at: string;

  updated_at: string;
}

export interface CreateIncomeRequest {
  amount: number;

  source: IncomeType;

  platform?: TripPlatform;

  business_name?: string;

  received_at?: string;

  notes?: string;
}

export interface UpdateIncomeRequest {
  amount?: number;

  source?: IncomeType;

  platform?: TripPlatform;

  business_name?: string;

  received_at?: string;

  notes?: string;
}