import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationPoint } from '@/features/tracking/services/location.service';
import { calculateSegmentDistanceMiles } from '@/features/tracking/services/distance.service';
import { DETECTION, observeShiftPoint, type Detector } from './detection';
import { validPoint } from '@/features/tracking/services/trip-journal';
export { DETECTION } from './detection';

export type Period = { client_id: string; started_at: string; ended_at: string | null };
export type PlatformPeriod = Period & { platform: string };
export type Segment = Period & { start_lat?: number | null; start_lng?: number | null; end_lat?: number | null; end_lng?: number | null; start_address?: string | null; end_address?: string | null; distance_miles: number; category: 'business' | 'personal'; excluded: boolean; platform_client_id: string | null; reviewed?: boolean; save_requested?: boolean; converted_at?: string | null; trip_id?: number | null };
export type Snapshot = Period & { revision: number; planned_end_at: string | null; platform_sessions: PlatformPeriod[]; segments: Segment[] };
export type Entry = { owner: string; data: Snapshot; local: boolean; dirty: boolean; sequence: number; pending?: { data: Snapshot; sequence: number }; detector: Detector; waitingForStop?: boolean; autoEnded?: boolean; midnightAt?: number; vehicleId?: string; resumeAfter?: number; endedNoticeClaimed?: boolean; blockedSegments?: string[] };
type Journal = { version: 1; recording: { owner: string; clientId: string } | null; entries: Entry[] };
const KEY = '@deduckly/shift-journal:v1';
let queue: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();
const deletedOwners = new Set<string>();
export function subscribeShifts(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const iso = (time: number) => new Date(time).toISOString();
function serial<T>(fn: () => Promise<T>): Promise<T> { const next = queue.then(fn); queue = next.catch(() => {}); return next; }
async function read(): Promise<Journal> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { version: 1, recording: null, entries: [] };
  const j: Journal = JSON.parse(raw);
  // Upgrade the development-only pointer without guessing between accounts.
  if (typeof j.recording === 'string' && Array.isArray(j.entries)) {
    const matches = j.entries.filter(e => e.data?.client_id === (j.recording as unknown) && e.local && !e.data.ended_at);
    j.recording = matches.length === 1 ? { owner: matches[0].owner, clientId: matches[0].data.client_id } : null;
  }
  if (j.version !== 1 || !Array.isArray(j.entries) || !(j.recording === null || (typeof j.recording?.owner === 'string' && typeof j.recording?.clientId === 'string')) || !j.entries.every(e => typeof e.owner === 'string' && e.data?.client_id && Array.isArray(e.data.segments) && Array.isArray(e.data.platform_sessions) && Number.isInteger(e.data.revision) && e.detector)) throw Error('Invalid Shift journal');
  return j;
}
async function write(j: Journal) { j.entries = j.entries.filter(e => !deletedOwners.has(e.owner)); if (j.recording && deletedOwners.has(j.recording.owner)) j.recording = null; await AsyncStorage.setItem(KEY, JSON.stringify(j)); listeners.forEach(fn => fn()); }
function touch(e: Entry) { e.dirty = true; e.sequence++; }
function active(j: Journal, owner: string) { return j.entries.find(e => e.owner === owner && e.local && !e.data.ended_at); }
function nextLocalMidnight(start: string) {
  const day = new Date(start);
  day.setHours(24, 0, 0, 0);
  return day.getTime();
}
function midnightAt(e: Entry) {
  return e.midnightAt ?? nextLocalMidnight(e.data.started_at);
}
export function listShifts(owner: string) { return serial(async () => (await read()).entries.filter(e => e.owner === owner)); }
export function activeShift(owner: string) { return serial(async () => active(await read(), owner) ?? null); }
export function recordingShift() { return serial(async () => { const j = await read(); return j.entries.find(e => e.data.client_id === j.recording?.clientId && e.owner === j.recording?.owner && e.local && !e.data.ended_at) ?? null; }); }
function finishSegment(e: Entry, end: number) {
  const d = e.detector;
  if (d.driving && d.start && d.miles >= DETECTION.minimumMiles) {
    const p = e.data.platform_sessions.find(p => !p.ended_at);
    e.data.segments.push({ client_id: id(), started_at: iso(d.start), ended_at: iso(end), distance_miles: Math.round(d.miles * 100) / 100, start_lat: d.first?.latitude ?? null, start_lng: d.first?.longitude ?? null, end_lat: d.endpoint?.latitude ?? null, end_lng: d.endpoint?.longitude ?? null, category: 'business', reviewed: false, excluded: false, platform_client_id: p?.client_id ?? null });
    touch(e);
  }
  e.detector = { miles: 0, driving: false };
}
function closeShift(j: Journal, e: Entry, end: number, automatic: boolean) {
  finishSegment(e, e.detector.last?.timestamp ?? end);
  const endedAt = iso(end);
  e.data.ended_at = endedAt;
  for (const period of e.data.platform_sessions) {
    if (!period.ended_at) period.ended_at = endedAt;
  }
  if (automatic) e.autoEnded = true;
  if (j.recording?.owner === e.owner && j.recording.clientId === e.data.client_id) j.recording = null;
  touch(e);
}
function closeAtMidnight(j: Journal, e: Entry, now: number) {
  const cutoff = midnightAt(e);
  if (!(cutoff <= now)) return false;
  // An upgraded journal may already contain observations or completed periods
  // after midnight. Keep those records and honor their original timestamps.
  let end = Math.max(cutoff, e.detector.last?.timestamp ?? 0);
  for (const period of [...e.data.platform_sessions, ...e.data.segments]) {
    end = Math.max(end, Date.parse(period.ended_at ?? period.started_at));
  }
  closeShift(j, e, end, true);
  return true;
}
export function setShiftRecording(owner: string | null) { return serial(async () => {
  const j = await read(); const target = owner ? active(j, owner) : undefined;
  const old = j.entries.find(e => e.data.client_id === j.recording?.clientId && e.owner === j.recording?.owner);
  if (old && old !== target) finishSegment(old, old.detector.last?.timestamp ?? Date.now());
  // Resume does not finalize on wall-clock silence; queued GPS fixes may still arrive.
  const next = target ? { owner: target.owner, clientId: target.data.client_id } : null;
  if (j.recording !== next || old || target) { j.recording = next; await write(j); }
}); }
export function startShift(owner: string, platform: string | null, planned: string | null, vehicleId?: string) { return serial(async () => {
  const j = await read();
  const time = Date.now();
  const previous = active(j, owner);
  if (previous && !closeAtMidnight(j, previous, time)) return previous;
  const now = iso(time);
  const e: Entry = { owner, local: true, dirty: true, sequence: 1, midnightAt: nextLocalMidnight(now), vehicleId, detector: { miles: 0, driving: false }, data: { client_id: id(), revision: 0, started_at: now, ended_at: null, planned_end_at: planned, platform_sessions: platform ? [{ client_id: id(), platform, started_at: now, ended_at: null }] : [], segments: [] } };
  j.entries.push(e); j.recording = { owner, clientId: e.data.client_id }; await write(j); return e;
}); }
export function editShift(owner: string, clientId: string, fn: (e: Entry) => void) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.owner === owner && e.data.client_id === clientId);
  if (!e) throw Error('Shift unavailable');
  const saved = e.data.segments.filter(s => s.converted_at).map(s => JSON.parse(JSON.stringify(s)) as Segment);
  fn(e); e.data.segments = e.data.segments.map(s => saved.find(old => old.client_id === s.client_id) ?? s); touch(e); await write(j);
}); }
export function switchPlatform(owner: string, clientId: string, platform: string | null) { return editShift(owner, clientId, e => {
  if (e.data.ended_at) throw Error('Shift ended');
  const now = Math.max(Date.now(), e.detector.last?.timestamp ?? 0);
  const previous = e.detector; finishSegment(e, previous.last?.timestamp ?? now);
  if (previous.driving) e.detector = { miles: 0, driving: true, start: now, movingSince: now, first: previous.last, endpoint: previous.last, anchor: previous.last, last: previous.last };
  e.data.platform_sessions.filter(p => !p.ended_at).forEach(p => { p.ended_at = iso(now); });
  if (platform) e.data.platform_sessions.push({ client_id: id(), platform, started_at: iso(now), ended_at: null });
}); }
export function endShift(owner: string, clientId: string) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.owner === owner && e.data.client_id === clientId);
  if (!e || e.data.ended_at) return;
  const now = Date.now();
  if (!closeAtMidnight(j, e, now)) closeShift(j, e, Math.max(now, e.detector.last?.timestamp ?? 0), false);
  await write(j);
}); }
// Close the pre-Trip segment and drop stale queued fixes before Shift resumes.
export function suspendShiftDetection(owner: string, boundary: number) { return serial(async () => {
  const j = await read();
  const e = active(j, owner);
  if (!e || (e.resumeAfter ?? 0) >= boundary) return;
  finishSegment(e, e.detector.last?.timestamp ?? boundary);
  e.waitingForStop = false;
  e.resumeAfter = boundary;
  await write(j);
}); }
export function recordShiftPoints(clientId: string, points: LocationPoint[], manualActive = false) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.data.client_id === clientId && e.owner === j.recording?.owner && !e.data.ended_at);
  if (!e || j.recording?.clientId !== clientId) return;
  const cutoff = Math.max(Date.parse(e.data.started_at), ...e.data.platform_sessions.map(p => Date.parse(p.ended_at ?? p.started_at)));
  let changed = false;
  const midnight = midnightAt(e);
  for (const p of [...points].sort((a,b) => a.timestamp-b.timestamp)) {
    if (p.timestamp >= midnight || p.timestamp <= (e.resumeAfter ?? 0) || p.timestamp < cutoff || !validPoint(p) || !Number.isFinite(p.accuracy) || p.accuracy < 0 || p.accuracy > DETECTION.accuracy || p.timestamp > Date.now()+DETECTION.futureSkewMs || (e.detector.last && p.timestamp <= e.detector.last.timestamp)) continue;
    let d = e.detector;
    // Reject impossible jumps only within observed continuous coverage.
    if (d.last && p.timestamp-d.last.timestamp <= DETECTION.gapMs && calculateSegmentDistanceMiles(d.last,p) === null) continue;
    if (observeShiftPoint(d,p, !!e.waitingForStop)) {
      const stop = d.stopPoint!;
      d.endpoint = stop;
      finishSegment(e, stop.timestamp); e.waitingForStop = false; d = e.detector;
      d.recent = [p]; // Keep a trustworthy stationary anchor for the next drive.
    }
    d.last = p; changed = true;
    if (!manualActive && e.data.planned_end_at && p.timestamp >= Date.parse(e.data.planned_end_at) && !d.driving && !d.movingSince && !e.waitingForStop) {
      closeShift(j, e, p.timestamp, true);
      break;
    }
  }
  if (!e.data.ended_at && closeAtMidnight(j, e, Date.now())) changed = true;
  if (changed) await write(j);
}); }
export function prepareShiftUpload(owner: string, skip: ReadonlySet<string> = new Set()) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.owner === owner && !skip.has(e.data.client_id) && (e.dirty || e.pending));
  if (!e) return null;
  if (!e.pending) { e.pending = { data: { ...JSON.parse(JSON.stringify(e.data)), revision: e.data.revision+1 }, sequence: e.sequence }; await write(j); }
  return e.pending.data;
}); }
// Only after an explicit "Another shift is active" rejection: the server
// checked the expected revision before rejecting and did not write this upload.
export function prepareEndedShiftAfterActiveConflict(owner: string, rejected: Snapshot) { return serial(async () => {
  const j = await read();
  const e = j.entries.find(e => e.owner === owner && e.data.client_id === rejected.client_id);
  if (!e?.pending || e.pending.data.revision !== rejected.revision || e.pending.data.ended_at ||
      rejected.ended_at || !e.data.ended_at) return null;
  const data = { ...e.data, revision: rejected.revision };
  e.pending = { data, sequence: e.sequence };
  await write(j);
  return data;
}); }
export function acknowledgeShift(owner: string, clientId: string, revision: number) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.owner === owner && e.data.client_id === clientId);
  if (!e?.pending || e.pending.data.revision !== revision) return;
  e.data.revision = revision; e.dirty = e.sequence !== e.pending.sequence; delete e.pending; await write(j);
}); }
export function importShiftHistory(owner: string, snapshots: Snapshot[]) { return serial(async () => {
  const j = await read();
  for (const data of snapshots) {
    const existing = j.entries.find(e => e.owner === owner && e.data.client_id === data.client_id);
    if (existing) {
      // Refresh a server-only copy when another device updates it. Never
      // replace a recording, a pending upload, or unsent local edits.
      if (!existing.local && !existing.dirty && !existing.pending && data.revision >= existing.data.revision) {
        existing.data = data;
        continue;
      }
      for (const remote of data.segments) {
        const local = existing.data.segments.find(s => s.client_id === remote.client_id);
        if (local && remote.converted_at) {
          if (existing.dirty || existing.pending) {
            // A conversion acknowledgement is authoritative, but must not
            // overwrite local mileage, timestamps, addresses or classification.
            local.converted_at = remote.converted_at;
            local.trip_id = remote.trip_id;
          } else Object.assign(local, remote);
        }
      }
      continue;
    }
    j.entries.push({ owner, data, local: false, dirty: false, sequence: 0, detector: { miles: 0, driving: false } });
  }
  await write(j);
}); }

// Intent is durable before network access; old segments retain their categories.
export function requestTripSave(owner: string, clientId: string) {
  return editShift(owner, clientId, e => { for (const s of e.data.segments) {
    if (s.ended_at && !s.excluded && !s.converted_at && s.reviewed !== false) s.save_requested = true;
  } });
}
export function autoEndIfDue(owner: string, manualActive: boolean, now = Date.now()) { return serial(async () => {
  const j = await read(); const e = active(j, owner);
  if (!e) return false;
  if (!closeAtMidnight(j, e, now)) {
    if (!e.data.planned_end_at || Date.parse(e.data.planned_end_at) > now || manualActive || e.detector.driving || e.detector.movingSince || e.waitingForStop) return false;
    closeShift(j, e, Math.max(now, e.detector.last?.timestamp ?? 0), true);
  }
  await write(j); return true;
}); }
export function claimEndedNotice(owner: string, clientId: string) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.owner === owner && e.data.client_id === clientId);
  if (!e?.autoEnded || e.endedNoticeClaimed) return false;
  e.endedNoticeClaimed = true; await write(j); return true;
}); }

export function setBlockedConversions(owner: string, blocked: { shift_client_id: string; client_id: string }[]) { return serial(async () => {
  const j = await read();
  for (const e of j.entries.filter(e => e.owner === owner)) e.blockedSegments = blocked.filter(b => b.shift_client_id === e.data.client_id).map(b => b.client_id);
  await write(j);
}); }

export function purgeShiftOwner(owner: string) {
  deletedOwners.add(owner);
  return serial(async () => { const journal = await read(); await write(journal); });
}
