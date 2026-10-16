import type { VehicleData } from './types';
export type CatalogChoice = { text: string; value: string };
export type CatalogState = { draft: VehicleData; years: CatalogChoice[]; makes: CatalogChoice[];
  models: CatalogChoice[]; configurations: CatalogChoice[]; loading: boolean; error: string; manual: boolean; ready: boolean };
export type CatalogRequest = (path: string, params?: Record<string, string | number>) => Promise<unknown>;
export function createVehicleCatalog(initial: VehicleData, request: CatalogRequest, changed: (state: CatalogState) => void) {
  let alive = true, revision = 0;
  let state: CatalogState = { draft: { ...initial }, years: [], makes: [], models: [], configurations: [],
    loading: false, error: '', manual: !!initial.make && !initial.epa_id, ready: !!initial.make && !!initial.model };
  const cache = new Map<string, Promise<unknown>>();
  function emit(update: Partial<CatalogState>) { state = { ...state, ...update }; if (alive) changed(state); }
  function get(path: string, params?: Record<string, string | number>) {
    const key = path + JSON.stringify(params ?? {});
    let promise = cache.get(key);
    if (!promise) {
      promise = request(path, params); cache.set(key, promise);
      void promise.catch(() => { if (cache.get(key) === promise) cache.delete(key); });
    }
    return promise;
  }
  function current(version: number) { return alive && revision === version; }
  async function choices(kind: string, version: number) {
    const d = state.draft;
    const params = kind === 'year' ? undefined : { year: d.year,
      ...(kind === 'model' || kind === 'options' ? { make: d.make } : {}), ...(kind === 'options' ? { model: d.model } : {}) };
    const result = await get('/api/v1/vehicles/catalog/' + kind, params);
    if (!Array.isArray(result) || !result.every(item => typeof item?.text === 'string' && typeof item?.value === 'string')) throw Error('Invalid catalog');
    if (current(version)) {
      const field = kind === 'year' ? 'years' : kind === 'make' ? 'makes' : kind === 'model' ? 'models' : 'configurations';
      emit({ [field]: result, error: result.length ? '' : 'No matching vehicles. Enter details manually.' });
    }
    return result as CatalogChoice[];
  }
  async function run(version: number, work: () => Promise<void>) {
    emit({ loading: true, error: '' });
    try { await work(); }
    catch { if (current(version)) emit({ error: 'Vehicle lookup unavailable. Enter details manually.' }); }
    finally { if (current(version)) emit({ loading: false }); }
  }
  function reset(data: Partial<VehicleData>) {
    return { ...state.draft, make: '', model: '', trim: null, epa_id: null, custom_mpg: null,
      city_mpg: null, highway_mpg: null, combined_mpg: null, kwh_per_100_miles: null, fuel_type: 'gasoline' as const, ...data };
  }
  function selectConfiguration(value: string) {
    if (state.loading || (value === state.draft.epa_id && state.ready)) return Promise.resolve();
    const version = ++revision;
    emit({ draft: { ...state.draft, epa_id: value, trim: null, city_mpg: null, highway_mpg: null, combined_mpg: null, custom_mpg: null, kwh_per_100_miles: null }, ready: false });
    return run(version, async () => {
      const result = await get('/api/v1/vehicles/catalog-details/' + encodeURIComponent(value)) as VehicleData;
      if (!current(version)) return;
      if (!result || result.epa_id !== value || result.year !== state.draft.year || result.make !== state.draft.make || result.model !== state.draft.model) throw Error('Mismatched configuration');
      const label = state.configurations.find(c => c.value === value)?.text;
      emit({ draft: { ...result, trim: [label, result.trim].filter(Boolean).join(' / ').slice(0, 200) || null,
        is_default: state.draft.is_default }, ready: true });
    });
  }
  async function loadConfigurations(version: number) {
    const list = await choices('options', version);
    if (current(version) && list.length === 1 && !state.draft.epa_id) {
      // Exactly one configuration needs no extra user selection.
      emit({ loading: false });
      await selectConfiguration(list[0].value);
    }
  }
  return {
    getState: () => state,
    start: () => {
      if (state.manual) return Promise.resolve();
      const version = ++revision;
      return run(version, async () => {
        await choices('year', version);
        if (!current(version) || !state.draft.year) return;
        await choices('make', version);
        if (!current(version) || !state.draft.make) return;
        await choices('model', version);
        if (!current(version) || !state.draft.model) return;
        await loadConfigurations(version);
      });
    },
    year: (value: string) => {
      if (Number(value) === state.draft.year) return Promise.resolve();
      const version = ++revision;
      emit({ draft: reset({ year: Number(value) }), makes: [], models: [], configurations: [], ready: false });
      return run(version, async () => { await choices('make', version); });
    },
    make: (value: string) => {
      if (value === state.draft.make) return Promise.resolve();
      const version = ++revision;
      emit({ draft: reset({ make: value }), models: [], configurations: [], ready: false });
      return run(version, async () => { await choices('model', version); });
    },
    model: (value: string) => {
      if (value === state.draft.model) return Promise.resolve();
      const version = ++revision;
      emit({ draft: reset({ make: state.draft.make, model: value }), configurations: [], ready: false });
      return run(version, async () => { await loadConfigurations(version); });
    },
    configuration: selectConfiguration,
    change: <K extends keyof VehicleData>(key: K, value: VehicleData[K]) => {
      const changedIdentity = state.manual && ['year','make','model','trim','fuel_type'].includes(key) && state.draft[key] !== value;
      const oldEstimate = changedIdentity && state.draft.epa_id ? { epa_id: null, city_mpg: null, highway_mpg: null, combined_mpg: null, kwh_per_100_miles: null } : {};
      emit({ draft: { ...state.draft, ...oldEstimate, ...(key === 'fuel_type' && state.draft.fuel_type !== value ? { custom_mpg: null, kwh_per_100_miles: null } : {}), [key]: value } });
    },
    manual: (value: boolean) => { revision++; emit({ manual: value, loading: false, error: '', ...(value && !state.ready ? { draft: { ...state.draft, epa_id: null } } : {}) }); },
    dispose: () => { alive = false; revision++; },
  };
}
