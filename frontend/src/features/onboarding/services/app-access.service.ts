import { getCurrentUser } from "@/features/auth/api/auth.api";
import { getAccessToken, invalidateSessionForToken } from "@/features/auth/services/auth-service.service";
import { trackingOwnerFromToken } from "@/features/tracking/services/tracking-owner";
import { getOnboardingStep } from "./onboarding.service";

export type AppAccess = "ready" | "onboarding" | "offline" | "login" | "stale";
export class OfflineSetupRequired extends Error {}

export function isConnectionFailure(error: unknown) {
  const failure = error as { isAxiosError?: boolean; code?: string; response?: { status?: number } };
  if (failure?.code === "ERR_SESSION_EXPIRED") return false;
  return !!failure?.isAxiosError && (!failure.response || (failure.response.status ?? 0) >= 500);
}

// Only an account with a saved, completed onboarding record can use offline entry.
// That record was originally created after a successful authenticated account load.
export async function resolveAppAccess(offline: boolean): Promise<AppAccess> {
  const owner = trackingOwnerFromToken(await getAccessToken());
  if (!owner || !/^\d+$/.test(owner) || !Number.isSafeInteger(Number(owner))) return "login";
  let completed = false;
  try { completed = await getOnboardingStep(Number(owner)) === 4; }
  catch { /* A local read failure must not prevent normal online account access. */ }
  if (trackingOwnerFromToken(await getAccessToken()) !== owner) return "stale";
  if (offline) {
    if (completed) return "offline";
    throw new OfflineSetupRequired();
  }
  try {
    const user = await getCurrentUser();
    const currentToken = await getAccessToken();
    if (trackingOwnerFromToken(currentToken) !== owner) return "stale";
    if (String(user.id) !== owner || !user.is_active) {
      await invalidateSessionForToken(currentToken);
      return "login";
    }
    const step = await getOnboardingStep(user.id);
    return step === 4 ? "ready" : "onboarding";
  } catch (error) {
    const current = await getAccessToken();
    const currentOwner = trackingOwnerFromToken(current);
    if (!currentOwner) return "login";
    if (currentOwner !== owner) return "stale";
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401 || status === 403 || status === 404) {
      await invalidateSessionForToken(current);
      return "login";
    }
    if (isConnectionFailure(error)) {
      if (completed) return "offline";
      throw new OfflineSetupRequired();
    }
    throw error;
  }
}
