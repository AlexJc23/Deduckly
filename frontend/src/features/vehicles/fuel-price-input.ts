import type { FuelAssumptions } from './assumptions';
export function parseFuelPrice(text: string): { valid: boolean; price: number | null } {
  const value = text.trim().replace(',', '.');
  if (!value) return { valid: true, price: null };
  const price = Number(value);
  return { valid: /^(?:\d+(?:\.\d{0,4})?|\.\d{1,4})$/.test(value) && Number.isFinite(price) && price >= 0 && price <= 100, price };
}
// Save only committed input. Serialize different values and share identical pending saves.
export function createFuelPriceSaver(save: (value: string) => Promise<unknown>, allowClear = false) {
  let last: string | null = null;
  let pending: Promise<unknown> = Promise.resolve();
  return (text: string, persist = save): Promise<unknown> => {
    const parsed = parseFuelPrice(text);
    if (!parsed.valid || (parsed.price === null && !allowClear)) return Promise.resolve();
    const value = parsed.price === null ? '' : String(parsed.price);
    if (value === last) return pending;
    last = value;
    const next = pending.catch(() => {}).then(() => persist(value));
    pending = next;
    void next.catch(() => { if (pending === next) last = null; });
    return next;
  };
}
export function withFuelPrice(a: FuelAssumptions | null, price: number | null, manual: boolean): FuelAssumptions | null {
  if (!a) return null;
  return { ...a, price, ...(manual ? { source: price === null ? 'Fuel price unavailable' : 'Current manual fuel price', observedAt: undefined, location: undefined } : {}) };
}
