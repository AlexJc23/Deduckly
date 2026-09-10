import { reverseGeocode } from "./location.service";
import { api } from "@/api/client";
import { getAccessToken } from "@/features/auth/services/auth-service.service";
import { trackingOwnerFromToken } from "./tracking-owner";
import { acknowledgeTrip, markUploadAttempt, pendingTrips } from "./trip-journal";
import type { Trip } from "@/features/trips/types/trips.types";

let syncing: Promise<void> | null = null;
export function syncRecordedTrips(): Promise<void> {
  if (syncing) return syncing;
  syncing = upload().finally(() => { syncing = null; });
  return syncing;
}
async function upload() {
  try {
    const ownerId = trackingOwnerFromToken(await getAccessToken());
    if (!ownerId) return;
    for (const pending of await pendingTrips(ownerId)) {
      const config = { deducklyOwnerId: ownerId };
      if (pending.attempted) {
        // The previous POST may have succeeded before its response was lost.
        // Use the existing list API to reconcile that response before retrying.
        const response = await api.get<Trip[]>("/api/v1/trips/", config);
        if (!Array.isArray(response.data)) return;
        const existing = response.data.find(trip =>
          new Date(trip.start_time).getTime() === new Date(pending.payload.start_time).getTime() &&
          new Date(trip.end_time).getTime() === new Date(pending.payload.end_time).getTime() &&
          trip.category === pending.payload.category && trip.platform === pending.payload.platform &&
          Math.abs(Number(trip.distance_miles) - pending.payload.distance_miles) < 0.011);
        if (existing) { await acknowledgeTrip(pending.id, ownerId); continue; }
      }
      const payload = { ...pending.payload };
      try {
        payload.start_address = payload.start_address ?? await reverseGeocode(payload.start_lat, payload.start_lng);
        payload.end_address = payload.end_address ?? await reverseGeocode(payload.end_lat, payload.end_lng);
      } catch { /* Address lookup must not prevent mileage from syncing. */ }
      await markUploadAttempt(pending.id, ownerId);
      await api.post("/api/v1/trips/", payload, config);
      await acknowledgeTrip(pending.id, ownerId);
    }
  } catch {
    // Keep the complete payload on disk. Retry when connectivity/app focus returns.
  }
}
