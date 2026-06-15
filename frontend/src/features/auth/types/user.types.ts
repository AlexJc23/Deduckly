export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  filing_status: string | null;
  created_at: string;
}
