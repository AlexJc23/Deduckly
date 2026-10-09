import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/api/client';
import { getAccessToken } from '@/features/auth/services/auth-service.service';
import { trackingOwnerFromToken } from '@/features/tracking/services/tracking-owner';
import { getAccountGeneration, isAccountChanging } from '@/features/auth/services/account-boundary';
import type { FuelType, FuelQuote, Vehicle, VehicleData, VehicleJournal } from './types';
const listeners = new Set<() => void>();
let queue: Promise<unknown> = Promise.resolve();
const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const n = Math.floor(Math.random() * 16); return (c === 'x' ? n : (n & 3) | 8).toString(16);
});
const key = (owner: string) => '@deduckly/vehicles:v1:' + encodeURIComponent(owner);
function serial<T>(fn: () => Promise<T>): Promise<T> { const next = queue.then(fn); queue = next.catch(() => {}); return next; }
export function subscribeVehicles(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
async function read(owner: string): Promise<VehicleJournal> {
  const raw = await AsyncStorage.getItem(key(owner));
  if (!raw) return { version: 1, owner, vehicles: [], pending: [], prices: {}, quotes: {} };
  const j = JSON.parse(raw);
  const validVehicle = (v: Vehicle) => typeof v?.id === 'string' && Number.isInteger(v.version) && v.version >= 1 &&
    typeof v.make === 'string' && typeof v.model === 'string' && typeof v.deleted === 'boolean';
  if (j.version !== 1 || j.owner !== owner || !Array.isArray(j.vehicles) || !Array.isArray(j.pending) || !j.prices || !j.quotes ||
    !j.vehicles.every(validVehicle) || !j.pending.every((op: VehicleJournal['pending'][number]) => typeof op?.id === 'string' && typeof op.data?.operation_id === 'string' && Number.isInteger(op.data.expected_version))) throw Error('Unreadable vehicle journal');
  return j;
}
async function write(j: VehicleJournal) { await AsyncStorage.setItem(key(j.owner), JSON.stringify(j)); listeners.forEach(fn => fn()); }
export function readVehicles(owner: string) { return serial(() => read(owner)); }
async function assertOwner(owner: string, generation: number) {
  if (isAccountChanging() || generation !== getAccountGeneration() || trackingOwnerFromToken(await getAccessToken()) !== owner) throw Error('Account changed');
}
export function saveLocalVehicle(owner: string, data: VehicleData, identity?: string, deleted = false) {
  const generation = getAccountGeneration();
  return serial(async () => {
    await assertOwner(owner, generation);
    const j = await read(owner), id = identity ?? uuid();
    const previous = j.vehicles.find(v => v.id === id);
    if (identity && (!previous || previous.deleted)) throw Error('Vehicle no longer available');
    const version = previous?.version ?? 0;
    const operation = { ...data, is_default: data.is_default && !deleted, deleted, expected_version: version, operation_id: uuid() };
    j.pending.push({ id, data: operation });
    if (operation.is_default) j.vehicles.forEach(v => { v.is_default = false; });
    j.vehicles = j.vehicles.filter(v => v.id !== id);
    j.vehicles.push({ ...data, is_default: operation.is_default, id, version: version + 1, deleted });
    await assertOwner(owner, generation); await write(j);
  });
}
export function savePrice(owner: string, fuel: FuelType, price: string) {
  const generation = getAccountGeneration();
  return serial(async () => { await assertOwner(owner, generation); const j = await read(owner); j.prices[fuel] = price; await write(j); });
}
export function saveQuote(owner: string, postal: string, quote: FuelQuote) {
  const generation = getAccountGeneration();
  return serial(async () => { await assertOwner(owner, generation); const j = await read(owner); j.quotes[postal + ':' + quote.fuel_type] = quote; await write(j); });
}
export function syncVehicles(owner: string) {
  const generation = getAccountGeneration();
  // Serialize edits and acknowledgements; the queue survives failed requests.
  return serial(async () => {
    await assertOwner(owner, generation);
    const config = { deducklyOwnerId: owner, deducklyGeneration: generation };
    const j = await read(owner);
    while (j.pending.length) {
      const op = j.pending[0];
      const response = await api.put<Vehicle>('/api/v1/vehicles/' + op.id, op.data, config);
      if (response.data.id !== op.id || response.data.version !== op.data.expected_version + 1) throw Error('Invalid vehicle acknowledgement');
      await assertOwner(owner, generation);
      j.pending.shift(); await write(j);
    }
    const response = await api.get<Vehicle[]>('/api/v1/vehicles/', config);
    await assertOwner(owner, generation);
    if (!Array.isArray(response.data)) throw Error('Invalid vehicles response');
    j.vehicles = response.data; await write(j);
  });
}
