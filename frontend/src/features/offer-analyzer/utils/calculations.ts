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