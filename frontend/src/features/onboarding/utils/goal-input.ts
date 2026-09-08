// Accept either decimal separator; never guess a thousands separator.
export function parseGoalInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(trimmed)) throw new Error("invalid-goal");
  const normalized = trimmed.replace(",", ".");
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) throw new Error("invalid-goal");
  return normalized;
}
