import { useEffect } from "react";
import { router } from "expo-router";

import { useTracking } from "@/features/tracking/context/tracking.context";
import { getPendingTrip } from "@/services/siri.service";

export function SiriStartup() {
  const { startTrackingFromSiri } = useTracking();

  useEffect(() => {
    const checkPendingTrip = async () => {
      console.log("🚀 SiriStartup running");

      const pendingTrip = await getPendingTrip();

      console.log("📦 Pending Trip:", pendingTrip);

      if (!pendingTrip) return;

      await startTrackingFromSiri(pendingTrip.platform);

      console.log("✅ Tracking started");

      router.replace("/tracking/active");

      console.log("➡️ Router replace called");
    };

    checkPendingTrip();
  }, []);

  return null;
}