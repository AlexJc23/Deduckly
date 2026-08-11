import { useEffect } from "react";
import { router } from "expo-router";

import { useTracking } from "@/features/tracking/context/tracking.context";
import { getPendingTrip } from "@/services/siri.service";

export function SiriStartup() {
  const { startTrackingFromSiri } = useTracking();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const pendingTrip = await getPendingTrip();

      if (!pendingTrip) {
        return;
      }

      await startTrackingFromSiri(pendingTrip.platform);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          router.replace("/tracking/active");
        });
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [startTrackingFromSiri]);

  return null;
}