export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  filing_status: string | null;
  two_fa_enabled: boolean;
  created_at: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  filing_status?: string | null;
}

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
}