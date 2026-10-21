import { api } from "@/api/client";
import { UserUpdate, UpdatePasswordRequest } from "../types/user.types";

export async function updateCurrentUser(
  user: UserUpdate
) {
  const response = await api.put(
    "/api/v1/users/me",
    user
  );

  return response.data;
}

export async function deleteCurrentUser() {
  const { getAccessToken, clearTokens } = await import('../services/auth-service.service');
  const { trackingOwnerFromToken } = await import('@/features/tracking/services/tracking-owner');
  const { getAccountGeneration } = await import('../services/account-boundary');
  const { purgeDeletedAccount } = await import('../services/deleted-account');
  const generation = getAccountGeneration();
  const token = await getAccessToken();
  const owner = trackingOwnerFromToken(token);
  if (!owner) throw Error('Account unavailable');
  const response = await api.delete(
    "/api/v1/users/me"
  );

  // Do not sign out a different account if a session changed during deletion.
  try {
    if (generation === getAccountGeneration() && owner === trackingOwnerFromToken(await getAccessToken())) await clearTokens();
  } finally { await purgeDeletedAccount(owner); }
  return response.data;
}
export async function updatePassword(
  data: UpdatePasswordRequest
) {
  const response = await api.post(
    "/api/v1/auth/update-password",
    data
  );
  return response.data;
}