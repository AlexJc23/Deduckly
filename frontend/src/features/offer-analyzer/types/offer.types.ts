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