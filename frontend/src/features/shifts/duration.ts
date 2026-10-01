export const SHIFT_DURATIONS = Array.from({ length: 97 }, (_, i) => i * 30);
export function plannedEndAt(start: number, minutes: number): string | null {
  if (!Number.isFinite(start) || !SHIFT_DURATIONS.includes(minutes)) throw Error('Invalid Shift duration');
  return minutes ? new Date(start + minutes * 60_000).toISOString() : null;
}
