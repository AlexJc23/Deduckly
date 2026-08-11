export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  filing_status: string | null;
  two_fa_enabled: boolean;
  created_at: string;
  is_premium: boolean;

  // Goals
  monthly_income_goal: string | null;
  weekly_income_goal: string | null;

  // Offer Analyzer
  minimum_hourly_rate: string | null;
  minimum_profit: string | null;
  minimum_dollars_per_mile: string | null;
  cost_per_mile: string | null;
  preferred_max_distance: string | null;

  // Preferences
  currency: string;
  distance_unit: string;
  week_starts_on: string;

  // Notifications
  notifications_enabled: boolean;
  trip_reminders_enabled: boolean;
  goal_reminders_enabled: boolean;

  // Tracking
  auto_trip_detection: boolean;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  filing_status?: string | null;

  // Goals
  monthly_income_goal?: string | null;
  weekly_income_goal?: string | null;

  // Offer Analyzer
  minimum_hourly_rate?: string | null;
  minimum_profit?: string | null;
  minimum_dollars_per_mile?: string | null;
  cost_per_mile?: string | null;
  preferred_max_distance?: string | null;

  // Preferences
  currency?: string;
  distance_unit?: string;
  week_starts_on?: string;

  // Notifications
  notifications_enabled?: boolean;
  trip_reminders_enabled?: boolean;
  goal_reminders_enabled?: boolean;

  // Tracking
  auto_trip_detection?: boolean;
}

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
}