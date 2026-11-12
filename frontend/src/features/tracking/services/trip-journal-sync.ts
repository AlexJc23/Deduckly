import { syncVehicleDependency } from "@/features/vehicles/store";
import { uploadAddress } from "./upload-address";
import { describeSyncIssue, isRecordRejection, type SyncIssue } from "./sync-issue";
import { api } from "@/api/client";
import { getAccessToken } from "@/features/auth/services/auth-service.service";
import { trackingOwnerFromToken } from "./tracking-owner";
import { acknowledgeTrip, markUploadAttempt, pendingTrips } from "./trip-journal";
import type { Trip } from "@/features/trips/types/trips.types";

import { queryClient } from "@/providers/query-client";
import { getAccountGeneration, isAccountChanging } from "@/features/auth/services/account-boundary";

function invalidateSavedTrips(generation: number) {
  if (isAccountChanging() || getAccountGeneration() !== generation) return;
  for (const key of ["trips", "income", "daily-goal", "monthly-goal", "report", "today-report"]) {
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
}

let latest: { generation: number; issue: SyncIssue | null } | undefined;
const listeners = new Set<() => void>();
export function subscribeTripSyncIssue(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function getTripSyncIssue() {
  return latest?.generation === getAccountGeneration() && !isAccountChanging() ? latest.issue : null;
}

let syncing: Promise<SyncIssue | null> | null = null;
export function syncRecordedTrips(): Promise<SyncIssue | null> {
  if (syncing) return syncing;
  const generation = getAccountGeneration();
  syncing = upload(generation).then(issue => {
    if (isAccountChanging() || getAccountGeneration() !== generation) return null;
    latest = { generation, issue };
    listeners.forEach(listener => listener());
    return issue;
  }).finally(() => { syncing = null; });
  return syncing;
}
async function upload(generation: number): Promise<SyncIssue | null> {
  const current = () => !isAccountChanging() && getAccountGeneration() === generation;
  let firstIssue: SyncIssue | null = null;
  try {
    const ownerId = trackingOwnerFromToken(await getAccessToken());
    if (!ownerId || !current()) return null;
    const config = { deducklyOwnerId: ownerId, deducklyGeneration: generation };
    for (const pending of await pendingTrips(ownerId)) {
      if (!current()) return null;
      try {
        if (pending.attempted && !pending.payload.client_id) {
          // A legacy POST may have succeeded before its response was lost.
          const response = await api.get<Trip[]>("/api/v1/trips/", config);
          if (!current()) return null;
          if (!Array.isArray(response.data)) throw Error("Invalid Trip history response");
          const existing = response.data.find(trip =>
            new Date(trip.start_time).getTime() === new Date(pending.payload.start_time).getTime() &&
            new Date(trip.end_time).getTime() === new Date(pending.payload.end_time).getTime() &&
            trip.category === pending.payload.category && trip.platform === pending.payload.platform &&
            Math.abs(Number(trip.distance_miles) - pending.payload.distance_miles) < 0.011);
          if (existing) { await acknowledgeTrip(pending.id, ownerId); invalidateSavedTrips(generation); continue; }
        }
        const payload = { ...pending.payload };
        await syncVehicleDependency(ownerId, payload.vehicle_id);
        // Only the outgoing address is shortened; original local data and the
        // trip creation fingerprint (which excludes addresses) stay unchanged.
        [payload.start_address, payload.end_address] = await Promise.all([
          payload.start_address?.slice(0, 100) ?? uploadAddress(payload.start_lat, payload.start_lng),
          payload.end_address?.slice(0, 100) ?? uploadAddress(payload.end_lat, payload.end_lng),
        ]);
        if (!current()) return null;
        if (!pending.attempted) await markUploadAttempt(pending.id, ownerId);
        if (!current()) return null;
        const { data } = await api.post<Trip>("/api/v1/trips/", payload, config);
        if (!current()) return null;
        if (!data || !Number.isSafeInteger(data.id) || data.id <= 0 || String(data.user_id) !== ownerId ||
            (payload.client_id && data.client_id !== payload.client_id)) {
          throw Error("Invalid Trip acknowledgement");
        }
        await acknowledgeTrip(pending.id, ownerId);
        invalidateSavedTrips(generation);
      } catch (error) {
        if (!current()) return null;
        if (!isRecordRejection(error, 'trip')) throw error;
        firstIssue ??= describeSyncIssue(error, 'trip');
      }
    }
  } catch (error) {
    // Keep the complete payload on disk. A network or session failure stops
    // this pass; a record-specific rejection above does not block later trips.
    return current() ? describeSyncIssue(error, 'trip') : null;
  }
  return firstIssue;
}
