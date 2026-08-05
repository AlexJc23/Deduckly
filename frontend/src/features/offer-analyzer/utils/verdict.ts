import { THRESHOLDS } from "..//constants/thresholds";
import {
  calculateDollarsPerMile,
  calculateHourlyRate,
} from "./calculations";
import {
  OfferInput,
  OfferResult,
} from "../types/offer.types";

export function analyzeOffer(
  input: OfferInput
): OfferResult {
  const dollarsPerMile = calculateDollarsPerMile(
    input.payout,
    input.distance
  );

  const hasTime = input.estimatedTime > 0;
  const hourlyRate = hasTime
    ? calculateHourlyRate(input.payout, input.estimatedTime)
    : 0;

  let verdict: OfferResult["verdict"] = "skip";
  const reasons: string[] = [];

  // -----------------------------
  // Verdict :) 
  // -----------------------------

  if (hasTime) {
    if (
      dollarsPerMile >= THRESHOLDS.GREAT.dollarsPerMile &&
      hourlyRate >= THRESHOLDS.GREAT.hourlyRate
    ) {
      verdict = "great";
    } else if (
      dollarsPerMile >= THRESHOLDS.GOOD.dollarsPerMile &&
      hourlyRate >= THRESHOLDS.GOOD.hourlyRate
    ) {
      verdict = "good";
    } else if (
      dollarsPerMile >= THRESHOLDS.AVERAGE.dollarsPerMile &&
      hourlyRate >= THRESHOLDS.AVERAGE.hourlyRate
    ) {
      verdict = "average";
    }
  } else {
    if (dollarsPerMile >= THRESHOLDS.GREAT.dollarsPerMile) {
      verdict = "great";
    } else if (dollarsPerMile >= THRESHOLDS.GOOD.dollarsPerMile) {
      verdict = "good";
    } else if (dollarsPerMile >= THRESHOLDS.AVERAGE.dollarsPerMile) {
      verdict = "average";
    }
  }

  // -----------------------------
  // Reasons
  // -----------------------------

  if (
    dollarsPerMile >= THRESHOLDS.GREAT.dollarsPerMile
  ) {
    reasons.push("Excellent dollars per mile.");
  } else if (
    dollarsPerMile >= THRESHOLDS.GOOD.dollarsPerMile
  ) {
    reasons.push("Good dollars per mile.");
  } else {
    reasons.push("Low dollars per mile.");
  }

  if (hasTime) {
    if (
      hourlyRate >= THRESHOLDS.GREAT.hourlyRate
    ) {
      reasons.push("Excellent hourly earnings.");
    } else if (
      hourlyRate >= THRESHOLDS.GOOD.hourlyRate
    ) {
      reasons.push("Good hourly earnings.");
    } else {
      reasons.push("Hourly earnings are below target.");
    }
  } else {
    reasons.push("Estimated time unavailable; verdict based on dollars per mile only.");
  }

  let color = "#EF4444"; // Skip

  if (verdict === "great") {
    color = "#22C55E";
  } else if (verdict === "good") {
    color = "#84CC16";
  } else if (verdict === "average") {
    color = "#F59E0B";
  }

  return {
    dollarsPerMile,
    hourlyRate,
    verdict,
    color,
    reasons,
  };
}