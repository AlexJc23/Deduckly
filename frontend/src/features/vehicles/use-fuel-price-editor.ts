import { useEffect, useMemo, useRef, useState } from 'react';
import { createFuelPriceSaver, parseFuelPrice } from './fuel-price-input';
export function useFuelPriceEditor(initial: string, scope: string, save?: (value: string) => Promise<unknown>, allowClear = false) {
  const [state, setState] = useState({ scope, value: initial, dirty: false, error: false });
  const currentScope = useRef(scope); currentScope.current = scope;
  const commitValue = useMemo(() => ({ scope, save: createFuelPriceSaver(async () => {
    throw new Error('Price storage unavailable');
  }, allowClear) }), [scope, allowClear]);
  useEffect(() => {
    setState(s => s.scope !== scope || !s.dirty ? { scope, value: initial, dirty: false, error: false } : s);
  }, [initial, scope]);
  const current = state.scope === scope ? state : { scope, value: initial, dirty: false, error: false };
  const parsed = parseFuelPrice(current.value);
  const commit = () => {
    if (!current.dirty || !parsed.valid || (parsed.price === null && !allowClear)) return;
    const value = current.value;
    void commitValue.save(value, save).then(() => {
      if (currentScope.current === scope) setState(s => s.value === value ? { ...s, dirty: false, error: false } : s);
    }).catch(() => {
      if (currentScope.current === scope) setState(s => s.value === value ? { ...s, error: true } : s);
    });
  };
  return { ...current, parsed, commit, change: (value: string) => setState({ scope, value: value.replace(',', '.'), dirty: true, error: false }) };
}
