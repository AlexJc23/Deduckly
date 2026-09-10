import { syncRecordedTrips } from "@/features/tracking/services/trip-journal-sync";
import { createTrip } from "../api/trips.api";
import {
  getPendingTrips,
  removePendingTrip,
} from "./offline-trip.service";
import { reverseGeocode } from "@/features/tracking/services/location.service";

let isSyncing = false;

export async function syncPendingTrips(): Promise<void> {
  // Don't let multiple syncs run at the same time.
  if (isSyncing) {
    return;
  }

  isSyncing = true;

  try {
    await syncRecordedTrips();
    const pendingTrips = await getPendingTrips();

    if (pendingTrips.length === 0) {
      return;
    }

    for (const pendingTrip of pendingTrips) {
      const payload = pendingTrip.payload;

      try {
        // Try to get the addresses now that we're back online.
        // If it fails, the trip can still be synced.
        let startAddress = payload.start_address;
        let endAddress = payload.end_address;

        try {
          startAddress = await reverseGeocode(
            payload.start_lat,
            payload.start_lng
          );

          endAddress = await reverseGeocode(
            payload.end_lat,
            payload.end_lng
          );
        } catch {
          // Keep the addresses we already have.
        }

        const syncedPayload = {
          ...payload,
          start_address: startAddress,
          end_address: endAddress,
        };

        try {
          await createTrip(syncedPayload);
        } catch (error: any) {
          const status = error?.response?.status;

          const detail =
            error?.response?.data?.detail;

          const isDuplicate =
            status === 409 ||
            (
              typeof detail === "string" &&
              detail
                .toLowerCase()
                .includes("already exists")
            );

          if (!isDuplicate) {
            // The trip didn't save, so leave it here
            // and try again when we're back online.
            return;
          }

          // The trip is already on the backend,
          // so we can remove the local copy.
        }

        // The trip is on the backend, so we don't
        // need to keep the local copy anymore.
        await removePendingTrip(
          pendingTrip.id
        );
      } catch {
        // Connection may have dropped again.
        // Leave the trip here for the next sync.
        return;
      }
    }
  } catch {
    // Storage can be temporarily unavailable; retain the queues and retry later.
  } finally {
    isSyncing = false;
  }
}