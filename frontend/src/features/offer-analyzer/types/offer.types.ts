export type OfferInput = {
    payout: number;
    distance: number;
    estimatedTime: number;
};


export type OfferResult = {
  dollarsPerMile: number;
  hourlyRate: number;
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
  profitHourlyRate: number;

  score: number;
  recommendation: PremiumRecommendation;
  summary: string;

  premiumChecks: PremiumCheck[];
};