import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

import { syncPendingTrips } from "../services/trip-sync.service";

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