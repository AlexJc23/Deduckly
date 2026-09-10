import { pauseRecording } from "@/features/tracking/services/background-tracking";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const invalidationListeners = new Set<() => void>();
let tokenWrites: Promise<unknown> = Promise.resolve();

function mutate<T>(operation: () => Promise<T>): Promise<T> {
  const next = tokenWrites.then(operation);
  tokenWrites = next.catch(() => {});
  return next;
}

export function subscribeToSessionInvalidation(listener: () => void) {
  invalidationListeners.add(listener);
  return () => { invalidationListeners.delete(listener); };
}

export function saveTokens(accessToken: string, refreshToken: string) {
  return mutate(async () => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  });
}

export function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function eraseTokens() {
  await pauseRecording();
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  invalidationListeners.forEach(listener => listener());
}

export function clearTokens() {
  return mutate(eraseTokens);
}

// A late response from an old session must not sign out a newly signed-in account.
export function invalidateSessionForToken(expectedToken: string | null) {
  return mutate(async () => {
    if (await getAccessToken() !== expectedToken) return;
    await eraseTokens();
  });
}
