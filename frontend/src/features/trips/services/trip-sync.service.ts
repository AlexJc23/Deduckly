import { syncRecordedTrips } from "@/features/tracking/services/trip-journal-sync";

export async function syncPendingTrips(): Promise<void> {
  // The old @deduckly/pending-trips queue has no provable owner. Leave it
  // quarantined in place for recovery; never assign it to the current account.
  // The modern journal serializes uploads and only uploads its authenticated owner.
  await syncRecordedTrips();
}
