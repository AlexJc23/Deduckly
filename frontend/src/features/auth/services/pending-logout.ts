import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ENV } from '@/config/env';

type PendingLogout = { refresh_token: string; expo_push_token: string | null; queuedAt: number };
const KEY = 'deduckly_pending_logout_v1';
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> { const next = queue.then(fn); queue = next.catch(() => {}); return next; }
async function read(): Promise<PendingLogout[]> {
  const value = JSON.parse(await SecureStore.getItemAsync(KEY) ?? '[]');
  if (!Array.isArray(value) || !value.every(item => typeof item.refresh_token === 'string' &&
      (item.expo_push_token === null || typeof item.expo_push_token === 'string') && Number.isFinite(item.queuedAt))) throw Error('Invalid logout recovery record');
  return value;
}
async function write(items: PendingLogout[]) {
  if (items.length) await SecureStore.setItemAsync(KEY, JSON.stringify(items));
  else await SecureStore.deleteItemAsync(KEY);
}
export function enqueueLogout(refreshToken: string, pushToken: string | null) {
  return serial(async () => {
    const items = await read();
    if (!items.some(item => item.refresh_token === refreshToken)) items.push({ refresh_token: refreshToken, expo_push_token: pushToken, queuedAt: Date.now() });
    await write(items);
  });
}
export function flushPendingLogouts() {
  return serial(async () => {
    const pending = await read(), keep: PendingLogout[] = [];
    for (const item of pending) {
      // Keep retry credentials only in SecureStore and no longer than a session lifetime.
      if (Date.now() - item.queuedAt > 30 * 24 * 60 * 60_000) continue;
      try {
        await axios.post(ENV.API_URL + '/api/v1/auth/logout', {
          refresh_token: item.refresh_token, expo_push_token: item.expo_push_token,
        }, { timeout: 10000 });
      } catch (error) {
        if ((error as { response?: { status: number } }).response?.status !== 404) keep.push(item);
      }
    }
    await write(keep);
  });
}
// Once registration succeeds, old logout retries may revoke sessions but must
// never detach the installation's newly registered destination (including re-login).
export function protectRegisteredDestination(token: string) {
  return serial(async () => {
    const items = await read();
    for (const item of items) if (item.expo_push_token === token) item.expo_push_token = null;
    await write(items);
  });
}
