import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/features/auth/context/auth.context";
import { getAccessToken } from "@/features/auth/services/auth-service.service";
import { localizedAlert } from "@/i18n/alerts";
import { trackingOwnerFromToken } from "../services/tracking-owner";
import { getActiveTrip, subscribeToTrips, type ActiveTrip, type TripStart } from "../services/trip-journal";
import { cancelRecording, endRecording, getRecordingMode, resumeRecording, startRecording, suspendForegroundRecording, subscribeToRecording } from "../services/background-tracking";
import { syncPendingTrips } from "@/features/trips/services/trip-sync.service";

type TrackingContextType = {
  isTracking: boolean;
  isReady: boolean;
  trackingMethod: TripStart["trackingMethod"];
  category: string | null;
  platform: string | null;
  startTime: Date | null;
  startLatitude: number | null;
  startLongitude: number | null;
  currentLatitude: number | null;
  currentLongitude: number | null;
  distanceMiles: number;
  trackingNotice: string | null;
  cancelTracking: () => Promise<boolean>;
  startTracking: (data: TripStart) => Promise<boolean>;
  startTrackingFromSiri: (platform: string) => Promise<boolean>;
  stopTracking: (incomeAmount?: number | null) => Promise<boolean | "discarded">;
};
const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const owner = useRef<string | null>(null);
  const [sessionOwnerId, setSessionOwnerId] = useState<string | null>(null);
  const [savedTrip, setTrip] = useState<ActiveTrip | null>(null);
  const [isReady, setReady] = useState(false);
  const [mode, setMode] = useState(getRecordingMode);
  const [loadFailed, setLoadFailed] = useState(false);
  const starting = useRef(false);
  const reload = useCallback(async () => {
    const id = owner.current;
    const saved = id ? await getActiveTrip(id) : null;
    if (owner.current === id) setTrip(saved);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    let alive = true;
    let refreshing = false;
    async function restore() {
      if (refreshing) return;
      refreshing = true;
      try {
        const id = isAuthenticated ? trackingOwnerFromToken(await getAccessToken()) : null;
        if (!alive) return;
        owner.current = id;
        setSessionOwnerId(id);
        await reload();
        await resumeRecording(id);
        if (alive && id) void syncPendingTrips();
        if (alive) { setLoadFailed(false); setMode(getRecordingMode()); }
      } catch {
        if (alive) setLoadFailed(true);
      } finally {
        refreshing = false;
        if (alive) setReady(true);
      }
    }
    setReady(false);
    void restore();
    const unsubscribe = subscribeToTrips(() => {
      if (alive) void reload().catch(() => { if (alive) setLoadFailed(true); });
    });
    const unsubscribeMode = subscribeToRecording(() => { if (alive) setMode(getRecordingMode()); });
    const appState = AppState.addEventListener("change", state => {
      if (state === "active") { void restore(); void syncPendingTrips(); }
      else if (state === "background") void suspendForegroundRecording().catch(() => { if (alive) setLoadFailed(true); });
    });
    return () => {
      alive = false;
      owner.current = null;
      setSessionOwnerId(null);
      unsubscribe(); unsubscribeMode(); appState.remove();
      // Background recording belongs to the trip, not the lifetime of this component.
    };
  }, [isAuthenticated, isLoading, reload]);

  const startTracking = useCallback(async (data: TripStart) => {
    if (!isReady || starting.current || !owner.current) return false;
    starting.current = true;
    try {
      const started = await startRecording(owner.current, data);
      await reload();
      return started;
    } catch {
      localizedAlert("Trip couldn’t start", "Check location access and available storage, then try again. Your saved trip has not been discarded.");
      return false;
    } finally { starting.current = false; }
  }, [isReady, reload]);
  const startTrackingFromSiri = useCallback((platform: string) => startTracking({
    category: "business", platform, trackingMethod: "automatic",
  }), [startTracking]);
  const cancelTracking = useCallback(async () => {
    if (!owner.current) return false;
    try { await cancelRecording(owner.current); await reload(); return true; }
    catch {
      localizedAlert("Trip couldn’t be canceled", "Your trip is still saved on this device. Please try again.");
      return false;
    }
  }, [reload]);
  const stopTracking = useCallback(async (income?: number | null) => {
    if (!owner.current) return false;
    try {
      const result = await endRecording(owner.current, income);
      await reload();
      void syncPendingTrips();
      return result;
    } catch {
      localizedAlert("Trip couldn’t be saved", "Your trip is still saved on this device. Please try again.");
      return false;
    }
  }, [reload]);

  const trip = isAuthenticated && savedTrip?.ownerId === sessionOwnerId ? savedTrip : null;
  const startTimestamp = trip?.startTime;
  const startTime = useMemo(() => startTimestamp === undefined ? null : new Date(startTimestamp), [startTimestamp]);

  const trackingNotice = loadFailed
    ? "Trip recovery needs attention. Reopen the app to try again. Saved trip data has not been discarded."
    : !trip ? null : mode === "paused"
    ? "Recording is paused. Your saved mileage is safe. Check location access and available storage, then reopen the app."
    : mode === "foreground"
    ? "Background tracking is unavailable. Keep Deduckly open to record mileage. Allow Always location access in Settings for background tracking."
    : trip.interrupted
    ? "Tracking was interrupted. Your recorded mileage was restored; miles traveled without GPS updates are not included."
    : null;

  return <TrackingContext.Provider value={{
    isTracking: isAuthenticated && !!trip, isReady,
    trackingMethod: trip?.trackingMethod ?? null, category: trip?.category ?? null,
    platform: trip?.platform ?? null, startTime,
    startLatitude: trip?.start.latitude ?? null, startLongitude: trip?.start.longitude ?? null,
    currentLatitude: trip?.last.latitude ?? null, currentLongitude: trip?.last.longitude ?? null,
    distanceMiles: trip?.distanceMiles ?? 0, trackingNotice,
    startTracking, startTrackingFromSiri, cancelTracking, stopTracking,
  }}>{children}</TrackingContext.Provider>;
}
export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) throw new Error("useTracking must be used inside TrackingProvider");
  return context;
}
