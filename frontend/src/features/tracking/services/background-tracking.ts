import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { localizedAlert } from "@/i18n/alerts";
import { translate } from "@/i18n/core";
import { Platform } from "react-native";
import { getCurrentLocation, toLocationPoint, watchLocation } from "./location.service";
import { beginTrip, discardTrip, finishTrip, getActiveTrip, getRecordingTrip, recordPoints, setRecording, type TripStart } from "./trip-journal";

export const TRIP_LOCATION_TASK = "deduckly-active-trip-location-v1";
export type RecordingMode = "background" | "foreground" | "paused";
let mode: RecordingMode = "paused";
let watcher: Location.LocationSubscription | null = null;
let watchingId: string | null = null;
let controls: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();
export const getRecordingMode = () => mode;
export function subscribeToRecording(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function updateMode(next: RecordingMode) {
  mode = next;
  listeners.forEach(listener => listener());
}
function control<T>(operation: () => Promise<T>): Promise<T> {
  const next = controls.then(operation);
  controls = next.catch(() => {});
  return next;
}
function recordingError() { updateMode("paused"); }

// Registered at module scope: Expo can run this without mounting any React screen.
if (!TaskManager.isTaskDefined(TRIP_LOCATION_TASK)) {
  TaskManager.defineTask<{ locations: Location.LocationObject[] }>(TRIP_LOCATION_TASK, async ({ data, error }) => {
    if (error) { recordingError(); return; }
    try {
      const trip = await getRecordingTrip();
      if (!trip) {
        // Recover a termination between the durable stop and native task cleanup.
        await control(async () => { if (!await getRecordingTrip()) await stopNative(); });
        return;
      }
      await recordPoints(trip.id, (data?.locations ?? []).map(toLocationPoint));
    } catch {
      // A storage failure must not silently look like successful recording.
      recordingError();
    }
  });
}
async function stopNative() {
  watcher?.remove();
  watcher = null;
  watchingId = null;
  if (Platform.OS !== "web" && await Location.hasStartedLocationUpdatesAsync(TRIP_LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(TRIP_LOCATION_TASK);
  }
  updateMode("paused");
}
async function attach(id: string, backgroundGranted: boolean) {
  await setRecording(id);
  if (backgroundGranted && Platform.OS !== "web" && await TaskManager.isAvailableAsync()) {
    try {
      if (!await Location.hasStartedLocationUpdatesAsync(TRIP_LOCATION_TASK)) {
        await Location.startLocationUpdatesAsync(TRIP_LOCATION_TASK, {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 0, timeInterval: 1000,
          activityType: Location.ActivityType.AutomotiveNavigation,
          pausesUpdatesAutomatically: false,
          showsBackgroundLocationIndicator: true,
          ...(Platform.OS === "android" ? { foregroundService: {
            notificationTitle: "Deduckly", notificationBody: translate("Trip recording is active"),
            killServiceOnDestroy: false,
          } } : {}),
        });
      }
      watcher?.remove(); watcher = null; watchingId = null;
      updateMode("background");
      return;
    } catch {
      // Keep the saved trip available and explicitly expose foreground-only mode.
      await stopNative();
    }
  } else if (Platform.OS !== "web" && await Location.hasStartedLocationUpdatesAsync(TRIP_LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(TRIP_LOCATION_TASK);
  }
  if (!watcher || watchingId !== id) {
    watcher?.remove(); watcher = null;
    watcher = await watchLocation(location => {
      void recordPoints(id, [toLocationPoint(location)]).catch(recordingError);
    }, recordingError);
    watchingId = id;
  }
  updateMode("foreground");
}
export function resumeRecording(ownerId: string | null) {
  return control(async () => {
    if (!ownerId) {
      await stopNative();
      await setRecording(null);
      return;
    }
    const trip = await getActiveTrip(ownerId);
    if (!trip) { await stopNative(); await setRecording(null); return; }
    const foreground = await Location.getForegroundPermissionsAsync();
    if (!foreground.granted) { await stopNative(); await setRecording(null); return; }
    const background = Platform.OS !== "web" && (await Location.getBackgroundPermissionsAsync()).granted;
    await attach(trip.id, background);
  });
}
export function startRecording(ownerId: string, data: TripStart) {
  return control(async () => {
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (!foreground.granted) {
      localizedAlert("Location access needed", "Allow location access in Settings to record your trip.");
      return false;
    }
    let background = Platform.OS !== "web" && (await Location.getBackgroundPermissionsAsync()).granted;
    if (!background && Platform.OS !== "web") {
      const proceed = await new Promise<boolean>(resolve => localizedAlert("Background location",
        "Allow background location to keep recording your active trip when the screen is locked or you use another app. Tracking stops when you end or cancel the trip.",
        [{ text: "Cancel", style: "cancel", onPress: () => resolve(false) },
         { text: "Continue", onPress: () => resolve(true) }], { cancelable: false }));
      if (!proceed) return false;
      background = (await Location.requestBackgroundPermissionsAsync()).granted;
    }
    const existing = await getActiveTrip(ownerId);
    const trip = existing ?? await beginTrip(ownerId, data, toLocationPoint(await getCurrentLocation()));
    try { await attach(trip.id, background); }
    catch { recordingError(); /* Preserve the trip even if the native listener fails. */ }
    return true;
  });
}
export function endRecording(ownerId: string, income?: number | null) {
  return control(async () => {
    // Commit locally before stopping. If storage fails, the active trip keeps recording.
    const result = await finishTrip(ownerId, income);
    try { await stopNative(); } catch { recordingError(); }
    return result;
  });
}
export function cancelRecording(ownerId: string) {
  return control(async () => {
    await discardTrip(ownerId);
    try { await stopNative(); } catch { recordingError(); }
  });
}
export function pauseRecording() {
  return control(async () => {
    // Stop native updates even if local storage is unavailable during sign-out.
    try { await setRecording(null); } finally { await stopNative(); }
  });
}

export function suspendForegroundRecording() {
  return control(async () => {
    if (mode === "foreground") {
      await setRecording(null);
      await stopNative();
    }
  });
}
