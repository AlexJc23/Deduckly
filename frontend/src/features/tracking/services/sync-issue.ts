export type SyncIssue = { message: string; status?: number };

type SyncError = { code?: string; response?: { status?: number; data?: { detail?: unknown } } };
const errorInfo = (error: unknown): SyncError => typeof error === 'object' && error !== null ? error : {};

export function isCompetingActiveShift(error: unknown) {
  const { response } = errorInfo(error);
  return response?.status === 409 && response.data?.detail === 'Another shift is active';
}

export function isRecordRejection(error: unknown, kind: 'shift' | 'trip') {
  const { response, code } = errorInfo(error);
  if (code === 'ERR_REFRESH_FAILED') return false;
  const status = response?.status;
  return status === 400 || status === 409 || status === 422 || (
    kind === 'trip' && status === 404 && typeof response?.data?.detail === 'string'
    && response.data.detail.startsWith('No mileage rate found for ')
  );
}

// Only display fixed messages and HTTP status, never response bodies, URLs, or GPS data.
export function describeSyncIssue(error: unknown, kind: 'shift' | 'trip'): SyncIssue {
  const { code, response } = errorInfo(error);
  const status = response?.status;
  let message: string;
  if (isCompetingActiveShift(error)) message = 'Your account already has an open Shift on the server. Sync it from the device that recorded it, or end this local Shift and sync again.';
  else if (status === 401 || code === 'ERR_SESSION_EXPIRED') message = 'Your session expired. Sign in again with the same account to sync saved records.';
  else if (code === 'ERR_REFRESH_FAILED') message = 'The server could not renew your session. Retry sync after checking that the backend is up to date.';
  else if (status === 403) message = 'The server denied sync for this account. Check that you are signed in to the right account.';
  else if (status === 409) message = kind === 'shift'
    ? 'This Shift conflicts with a server version. Try syncing the other device first. If it persists, contact support.'
    : 'A Trip conflicts with an existing server record. It was kept locally for review.';
  else if (isRecordRejection(error, kind)) message = kind === 'shift'
    ? 'The server rejected a saved Shift. It was kept locally for review.'
    : 'The server rejected a saved Trip. It was kept locally for review.';
  else if (status === 404) message = 'The sync endpoint or record was not found. Check that the backend is up to date.';
  else if (status && status >= 500) message = 'The server is unavailable. Try syncing again later.';
  else if (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || code === 'ETIMEDOUT') message = 'Could not reach the server. Check your connection and try syncing again.';
  else message = 'Sync could not finish. Retry sync. If it persists, contact support.';
  return { message, status };
}
