export type OfferInput = {
    payout: number;
    distance: number;
    estimatedTime?: number | null;
    additionalMiles?: number;
};


export type OfferResult = {
  fuel?: { cost: number | null; afterFuel: number | null; grossPayout: number; drivingMiles: number; grossDollarsPerMile: number; grossHourly: number | null; assumptions: import("@/features/vehicles/assumptions").FuelAssumptions | null };
  dollarsPerMile: number;
  hourlyRate: number | null;
  verdict: "great" | "good" | "average" | "skip";
  color: string;
  reasons: string[];
};

// export type PremiumReason = {
//   passed: boolean;
//   message: string;
// };

export type OfferPreferences = {
  costPerMile: number;
  minimumProfit: number;
  minimumHourRate: number;
  minimumDollarsPerMile: number;
  preferredMaxDistance: number;
};


export type PremiumRecommendation =
  | "accept"
  | "consider"
  | "decline";

  export type PremiumCheck = {
  title: string;
  passed: boolean;
  actual: number;
  target: number;
};

export type PremiumOfferResult = OfferResult & {
  vehicleCost: number;
  estimatedProfit: number;
  profitHourlyRate: number | null;

  score: number;
  recommendation: PremiumRecommendation;
  summary: string;

  premiumChecks: PremiumCheck[];
};