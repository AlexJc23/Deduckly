import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LocationPoint } from "./location.service";
import { calculateSegmentDistanceMiles } from "./distance.service";
import { buildTripPayload } from "./tracking.service";
import type { TripCreate } from "@/features/trips/types/trips.types";

const KEY = "@deduckly/trip-journal:v1";
// Do not turn an unobserved route into straight-line mileage after a GPS gap.
export const MAX_POINT_GAP_MS = 120_000;
export type TripStart = {
  category: string;
  platform: string | null;
  trackingMethod: "automatic" | "manual" | null;
};
export type ActiveTrip = TripStart & {
  id: string;
  ownerId: string;
  startTime: number;
  start: LocationPoint;
  last: LocationPoint;
  distanceMiles: number;
  interrupted: boolean;
  needsAnchor?: boolean;
};
type PendingTrip = { id: string; ownerId: string; payload: TripCreate; attempted?: boolean };
type Journal = {
  version: 1;
  recordingId: string | null;
  active: ActiveTrip[];
  pending: PendingTrip[];
};
let queue: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();
export function subscribeToTrips(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function serial<T>(operation: () => Promise<T>): Promise<T> {
  const next = queue.then(operation);
  queue = next.catch(() => {});
  return next;
}
export function validPoint(point: LocationPoint): boolean {
  return Number.isFinite(point?.latitude) && Math.abs(point.latitude) <= 90 &&
    Number.isFinite(point?.longitude) && Math.abs(point.longitude) <= 180 &&
    Number.isFinite(point.timestamp) && point.timestamp > 0;
}
async function read(): Promise<Journal> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { version: 1, recordingId: null, active: [], pending: [] };
  const value: Journal = JSON.parse(raw);
  // Fail closed: never overwrite an unreadable saved trip with a new one.
  if (value.version !== 1 || !Array.isArray(value.active) || !Array.isArray(value.pending) ||
      !(value.recordingId === null || typeof value.recordingId === "string") ||
      !value.active.every(trip => typeof trip.id === "string" && typeof trip.ownerId === "string" &&
        typeof trip.category === "string" && Number.isFinite(trip.startTime) &&
        validPoint(trip.start) && validPoint(trip.last) &&
        Number.isFinite(trip.distanceMiles) && trip.distanceMiles >= 0) ||
      !value.pending.every(trip => typeof trip.id === "string" && typeof trip.ownerId === "string" && trip.payload)) {
    throw new Error("Unreadable trip journal");
  }
  return value;
}
async function write(journal: Journal) {
  // The active trip and its completed upload entry move in a SINGLE storage write.
  // A restart between ending and uploading cannot resurrect the ended trip.
  await AsyncStorage.setItem(KEY, JSON.stringify(journal));
  listeners.forEach(listener => listener());
}
export function getActiveTrip(ownerId: string) {
  return serial(async () => (await read()).active.find(trip => trip.ownerId === ownerId) ?? null);
}
export function getRecordingTrip() {
  return serial(async () => {
    const journal = await read();
    return journal.active.find(trip => trip.id === journal.recordingId) ?? null;
  });
}
export function beginTrip(ownerId: string, data: TripStart, point: LocationPoint) {
  return serial(async () => {
    const journal = await read();
    const existing = journal.active.find(trip => trip.ownerId === ownerId);
    if (existing) return existing;
    if (!validPoint(point)) throw new Error("Invalid starting location");
    const trip: ActiveTrip = {
      ...data, ownerId, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      startTime: Date.now(), start: point, last: point, distanceMiles: 0, interrupted: false,
    };
    journal.active.push(trip);
    journal.recordingId = trip.id;
    await write(journal);
    return trip;
  });
}
export function setRecording(id: string | null) {
  return serial(async () => {
    const journal = await read();
    const target = journal.active.find(trip => trip.id === id);
    const stale = !!target && Date.now() - target.last.timestamp > MAX_POINT_GAP_MS;
    if (journal.recordingId === id && (!stale || target?.interrupted)) return;
    const previous = journal.active.find(trip => trip.id === journal.recordingId);
    if (previous && previous.id !== id) { previous.interrupted = true; previous.needsAnchor = true; }
    if (target && stale) { target.interrupted = true; target.needsAnchor = true; }
    journal.recordingId = id;
    await write(journal);
  });
}
export function recordPoints(id: string, points: LocationPoint[]) {
  return serial(async () => {
    const journal = await read();
    const trip = journal.active.find(trip => trip.id === id);
    if (!trip || journal.recordingId !== id) return;
    let changed = false;
    for (const point of [...points].sort((a, b) => a.timestamp - b.timestamp)) {
      if (!validPoint(point) || point.timestamp <= trip.last.timestamp ||
          point.timestamp > Date.now() + 60_000 || point.accuracy > 100) continue;
      if (trip.needsAnchor || point.timestamp - trip.last.timestamp > MAX_POINT_GAP_MS) {
        trip.needsAnchor = false;
        trip.interrupted = true;
        trip.last = point;
        changed = true;
        continue;
      }
      const miles = calculateSegmentDistanceMiles(trip.last, point);
      if (miles === null || !Number.isFinite(miles)) continue;
      trip.distanceMiles += miles;
      trip.last = point;
      changed = true;
    }
    if (changed) await write(journal);
  });
}
export function finishTrip(ownerId: string, incomeAmount?: number | null) {
  return serial(async () => {
    const journal = await read();
    const trip = journal.active.find(trip => trip.ownerId === ownerId);
    if (!trip) return false;
    const discarded = trip.distanceMiles < 0.02;
    if (!discarded) {
      journal.pending.push({ id: trip.id, ownerId, payload: buildTripPayload({
        startTime: new Date(trip.startTime), endTime: new Date(), distanceMiles: trip.distanceMiles,
        startLatitude: trip.start.latitude, startLongitude: trip.start.longitude,
        endLatitude: trip.last.latitude, endLongitude: trip.last.longitude,
        start_address: null, end_address: null, category: trip.category,
        platform: trip.category === "personal" ? "personal" : trip.platform ?? "", incomeAmount,
      }) });
    }
    journal.active = journal.active.filter(item => item.id !== trip.id);
    if (journal.recordingId === trip.id) journal.recordingId = null;
    await write(journal);
    return discarded ? "discarded" as const : true;
  });
}
export function discardTrip(ownerId: string) {
  return serial(async () => {
    const journal = await read();
    const trip = journal.active.find(trip => trip.ownerId === ownerId);
    if (!trip) return;
    journal.active = journal.active.filter(item => item.id !== trip.id);
    if (journal.recordingId === trip.id) journal.recordingId = null;
    await write(journal);
  });
}
export function pendingTrips(ownerId: string) {
  return serial(async () => (await read()).pending.filter(trip => trip.ownerId === ownerId));
}
export function acknowledgeTrip(id: string, ownerId: string) {
  return serial(async () => {
    const journal = await read();
    journal.pending = journal.pending.filter(trip => trip.id !== id || trip.ownerId !== ownerId);
    await write(journal);
  });
}

export function markUploadAttempt(id: string, ownerId: string) {
  return serial(async () => {
    const journal = await read();
    const trip = journal.pending.find(item => item.id === id && item.ownerId === ownerId);
    if (trip) { trip.attempted = true; await write(journal); }
  });
}
