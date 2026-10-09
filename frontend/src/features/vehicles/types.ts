export type FuelType = 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other';
export type VehicleData = {
  year: number; make: string; model: string; trim: string | null; fuel_type: FuelType;
  city_mpg: number | null; highway_mpg: number | null; combined_mpg: number | null;
  custom_mpg: number | null; kwh_per_100_miles: number | null; epa_id: string | null; is_default: boolean;
};
export type Vehicle = VehicleData & { id: string; version: number; deleted: boolean };
export type VehicleWrite = VehicleData & { expected_version: number; operation_id: string; deleted: boolean };
export type FuelQuote = { price: number; unit: 'USD/US-gallon' | 'USD/kWh'; fuel_type: FuelType; source: string; location: string; observed_at: string };
export type VehicleJournal = { version: 1; owner: string; vehicles: Vehicle[];
  pending: { id: string; data: VehicleWrite }[]; prices: Partial<Record<FuelType, string>>;
  quotes: Record<string, FuelQuote> };
