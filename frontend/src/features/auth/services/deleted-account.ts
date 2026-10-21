import AsyncStorage from '@react-native-async-storage/async-storage';
import { purgeTripOwner } from '@/features/tracking/services/trip-journal';
import { purgeShiftOwner } from '@/features/shifts/journal';
import { purgeVehicleOwner } from '@/features/vehicles/store';
import { purgeCachedReports } from '@/features/reports/utils/save-file';

// Only successful server deletions enter this retry list. Never purge on logout.
const KEY = '@deduckly/deleted-account-cleanup:v1';
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> { const next = queue.then(fn); queue = next.catch(() => {}); return next; }
async function owners(): Promise<string[]> {
  const value = JSON.parse(await AsyncStorage.getItem(KEY) ?? '[]');
  if (!Array.isArray(value) || !value.every(owner => typeof owner === 'string')) throw Error('Invalid deletion cleanup record');
  return value;
}
async function clean(pending: string[]) {
  for (const owner of [...pending]) {
    await Promise.all([purgeTripOwner(owner), purgeShiftOwner(owner), purgeVehicleOwner(owner)]);
    await purgeCachedReports();
    pending = pending.filter(value => value !== owner);
    await AsyncStorage.setItem(KEY, JSON.stringify(pending));
  }
}
export function purgeDeletedAccount(owner: string) {
  return serial(async () => {
    const pending = [...new Set([...(await owners()), owner])];
    await AsyncStorage.setItem(KEY, JSON.stringify(pending));
    await clean(pending);
  });
}
export function retryDeletedAccountCleanup() { return serial(async () => clean(await owners())); }
