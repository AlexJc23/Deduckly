import { useEffect, useSyncExternalStore } from "react";
import NetInfo from "@react-native-community/netinfo";

import { syncPendingTrips } from "../services/trip-sync.service";
import { subscribeAccountBoundary } from "@/features/auth/services/account-boundary";
import { getTripSyncIssue, subscribeTripSyncIssue } from "@/features/tracking/services/trip-journal-sync";

export function useTripSync() {
  useEffect(() => {
    syncPendingTrips();

    const unsubscribe = NetInfo.addEventListener(
      (state) => {
        if (state.isConnected) {
          syncPendingTrips();
        }
      }
    );

    return unsubscribe;
  }, []);
}


function subscribeToIssue(listener: () => void) {
  const trip = subscribeTripSyncIssue(listener);
  const account = subscribeAccountBoundary(listener);
  return () => { trip(); account(); };
}

export function useTripSyncIssue() {
  return useSyncExternalStore(subscribeToIssue, getTripSyncIssue, () => null);
}
