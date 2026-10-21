// The viewport has already had the safe area and navigator removed by its parents.
export function dashboardLayout(height: number, activeShift: boolean) {
  const density = Math.max(0, Math.min(1, ((height || 760) - (activeShift ? 55 : 0) - 520) / 260));
  return {
    density,
    gap: 8 + 8 * density,
    padding: 12 + 6 * density,
    actionHeight: 48 + 36 * density,
    amountSize: 32 + 16 * density,
    nameSize: 26 + 10 * density,
    iconSize: 32 + 16 * density,
    showSupportingText: density >= 0.25,
  };
}
