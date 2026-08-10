import { useEffect } from "react";
import { router } from "expo-router";

import { useTracking } from "../context/tracking.context";
import { getPendingTrip } from "@/services/siri.service";

export function useSiriStartup() {
  const { startTrackingFromSiri } = useTracking();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const pendingTrip = await getPendingTrip();

      if (!pendingTrip) return;

      await startTrackingFromSiri(pendingTrip.platform);

      router.replace("/tracking/active");
    }, 500);

    return () => clearTimeout(timer);
  }, [startTrackingFromSiri]);
}