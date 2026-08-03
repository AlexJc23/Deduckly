export function calculateDollarsPerMile(
  payout: number,
  distance: number
): number {
  return Number(
    (payout / distance).toFixed(2)
  );
}

export function calculateHourlyRate(
  payout: number,
  estimatedTime: number
): number {
  const minutes = Math.max(estimatedTime, 10);
  const hours = minutes / 60;

  const hourly = payout / hours;

  return Number(
    Math.min(hourly, 150).toFixed(2)
  );
}

export function calculateVehicleCost(
  distance: number,
  costPerMile: number
): number {
  return Number(
    (distance * costPerMile).toFixed(2)
  );
}

export function calculateEstimatedProfit(
  payout: number,
  vehicleCost: number
): number {
  return Number(
    (payout - vehicleCost).toFixed(2)
  );
}

export function calculateProfitHourlyRate(
  estimatedProfit: number,
  estimatedTime: number
): number {
  const minutes = Math.max(estimatedTime, 10);
  const hours = minutes / 60;

  return Number(
    Math.min(
      estimatedProfit / hours,
      150
    ).toFixed(2)
  );
}