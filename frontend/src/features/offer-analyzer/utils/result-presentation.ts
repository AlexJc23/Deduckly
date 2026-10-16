import { THRESHOLDS } from '../constants/thresholds';
import type { OfferResult, PremiumOfferResult } from '../types/offer.types';
export type ResultMetric = { label: string; value: number; unit: 'money' | 'per-mile' | 'per-hour' | 'miles' | 'score'; group: string };
// Presentation only: every amount comes directly from the existing engine.
export function presentOfferResult(result: OfferResult | PremiumOfferResult) {
  const premium = 'score' in result;
  const recommendation = premium ? result.recommendation : result.verdict === 'skip' ? 'decline' : result.verdict === 'average' ? 'consider' : 'accept';
  const f = result.fuel;
  const hasFuel = f?.cost != null && f.afterFuel != null;
  const same = (a: number, b: number) => a.toFixed(2) === b.toFixed(2);
  const energy = f?.assumptions?.fuelType === 'electric';
  const hero: ResultMetric | null = hasFuel
    ? { label: same(f.afterFuel!, f.grossPayout) ? (energy ? 'Gross payout / earnings after energy' : 'Gross payout / earnings after fuel') : energy ? 'Estimated earnings after energy' : 'Estimated earnings after fuel', value: f.afterFuel!, unit: 'money', group: 'earnings' }
    : premium && (!f || !same(result.estimatedProfit, f.grossPayout))
    ? { label: 'Estimated earnings after vehicle costs', value: result.estimatedProfit, unit: 'money', group: 'earnings' }
    : f ? { label: 'Gross offer payout', value: f.grossPayout, unit: 'money', group: 'earnings' } : null;
  const primary: ResultMetric[] = [{ label: hasFuel ? 'Fuel-adjusted dollars / mile' : 'Gross dollars per mile', value: result.dollarsPerMile, unit: 'per-mile', group: 'per-mile' }];
  if (premium && hasFuel && !same(result.estimatedProfit, f.afterFuel!)) primary.unshift({ label: 'Estimated earnings after vehicle costs', value: result.estimatedProfit, unit: 'money', group: 'earnings' });
  const hourly = premium ? result.profitHourlyRate : result.hourlyRate;
  if (hourly !== null) primary.push({ label: premium ? 'After vehicle costs / hour' : hasFuel ? 'After fuel / hour' : 'Gross hourly earnings', value: hourly, unit: 'per-hour', group: 'per-hour' });
  const breakdown: ResultMetric[] = [];
  if (f && (!hero || !same(hero.value, f.grossPayout))) breakdown.push({ label: 'Gross offer payout', value: f.grossPayout, unit: 'money', group: 'earnings' });
  if (hasFuel) breakdown.push({ label: energy ? 'Estimated energy cost' : 'Estimated fuel cost', value: f.cost!, unit: 'money', group: 'cost' });
  const candidates: ResultMetric[] = [];
  if (premium) candidates.push({ label: 'Score', value: result.score, unit: 'score', group: 'score' });
  if (f) {
    candidates.push({ label: 'Gross dollars per mile', value: f.grossDollarsPerMile, unit: 'per-mile', group: 'per-mile' });
    if (f.grossHourly !== null) candidates.push({ label: 'Gross hourly earnings', value: f.grossHourly, unit: 'per-hour', group: 'per-hour' });
    candidates.push({ label: 'Estimated driving miles', value: f.drivingMiles, unit: 'miles', group: 'miles' });
  }
  if (result.hourlyRate !== null) candidates.push({ label: hasFuel ? 'After fuel / hour' : 'Gross hourly earnings', value: result.hourlyRate, unit: 'per-hour', group: 'per-hour' });
  if (premium) candidates.push({ label: 'Total estimated vehicle cost', value: result.vehicleCost, unit: 'money', group: 'cost' });
  const shown = [...(hero ? [hero] : []), ...primary, ...breakdown];
  const details = candidates.filter(metric => {
    if (shown.some(other => other.group === metric.group && same(other.value, metric.value))) return false;
    shown.push(metric); return true;
  });
  return { recommendation, premium, hasFuel, energy, hero, primary, breakdown, details,
    explanation: recommendation === 'accept' ? 'Meets most earning targets.' : recommendation === 'consider' ? 'Some earning targets were missed.' : 'Below the analyzer’s earning targets.',
    standardTargets: premium ? [] : Object.entries(THRESHOLDS).filter(([tier]) => tier !== 'AVERAGE' || result.hourlyRate !== null).map(([tier, target]) => ({ tier, ...target })),
    checks: premium ? result.premiumChecks : [], reasons: premium ? [] : result.reasons,
  };
}
