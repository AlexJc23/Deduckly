import {
  OfferInput,
  OfferPreferences,
  PremiumOfferResult,
  PremiumCheck,
} from "../types/offer.types";

import { analyzeOffer } from "./verdict";

import {
  calculateVehicleCost,
  calculateEstimatedProfit,
  calculateProfitHourlyRate,
} from "./calculations";

export function analyzePremiumOffer(
  input: OfferInput,
  preferences: OfferPreferences
): PremiumOfferResult {
  const basic = analyzeOffer(input);

  const vehicleCost = calculateVehicleCost(
    input.distance,
    preferences.costPerMile
  );

  const estimatedProfit = calculateEstimatedProfit(
    input.payout,
    vehicleCost
  );

  const profitHourlyRate =
    calculateProfitHourlyRate(
      estimatedProfit,
      input.estimatedTime
    );

  let score = 100;

  const premiumChecks: PremiumCheck[] = [];

  // -----------------------------
  // Minimum Profit
  // -----------------------------

  const profitPassed =
    estimatedProfit >=
    preferences.minimumProfit;

  premiumChecks.push({
    title: "Minimum Profit",
    passed: profitPassed,
    actual: estimatedProfit,
    target: preferences.minimumProfit,
  });

  if (!profitPassed) {
    score -= 30;
  }

  // -----------------------------
  // Hourly Earnings
  // -----------------------------

  const hourlyPassed =
    profitHourlyRate >=
    preferences.minimumHourRate;

  premiumChecks.push({
    title: "Hourly Earnings",
    passed: hourlyPassed,
    actual: profitHourlyRate,
    target: preferences.minimumHourRate,
  });

  if (!hourlyPassed) {
    score -= 30;
  }

  // -----------------------------
  // Dollars Per Mile
  // -----------------------------

  const dpmPassed =
    basic.dollarsPerMile >=
    preferences.minimumDollarsPerMile;

  premiumChecks.push({
    title: "Dollars Per Mile",
    passed: dpmPassed,
    actual: basic.dollarsPerMile,
    target:
      preferences.minimumDollarsPerMile,
  });

  if (!dpmPassed) {
    score -= 25;
  }

  // -----------------------------
  // Preferred Distance
  // -----------------------------

  const distancePassed =
    input.distance <=
    preferences.preferredMaxDistance;

  premiumChecks.push({
    title: "Trip Distance",
    passed: distancePassed,
    actual: input.distance,
    target:
      preferences.preferredMaxDistance,
  });

  if (!distancePassed) {
    score -= 15;
  }

  score = Math.max(0, score);

  let recommendation:
    | "accept"
    | "consider"
    | "decline";

  if (score >= 80) {
    recommendation = "accept";
  } else if (score >= 60) {
    recommendation = "consider";
  } else {
    recommendation = "decline";
  }

  let summary = "";

  switch (recommendation) {
    case "accept":
      summary =
        "Excellent offer. This trip meets most of your earning goals.";
      break;

    case "consider":
      summary =
        "Decent offer, but one or more of your preferred targets were missed.";
      break;

    case "decline":
      summary =
        "This offer doesn't meet your preferred earning goals.";
      break;
  }

  return {
    ...basic,

    vehicleCost,
    estimatedProfit,
    profitHourlyRate,

    score,
    recommendation,
    summary,

    premiumChecks,
  };
}