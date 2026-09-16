let generation = 0;
let changing = false;
const listeners = new Set<() => void>();
export const getAccountGeneration = () => generation;
export const isAccountChanging = () => changing;
export function subscribeAccountBoundary(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function beginAccountBoundary() {
  changing = true;
  generation++;
  listeners.forEach(listener => listener());
}
export function finishAccountBoundary() { changing = false; }
