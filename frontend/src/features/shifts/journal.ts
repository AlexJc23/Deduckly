import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationPoint } from '@/features/tracking/services/location.service';
import { calculateSegmentDistanceMiles } from '@/features/tracking/services/distance.service';
import { validPoint } from '@/features/tracking/services/trip-journal';

export type Period = { client_id: string; started_at: string; ended_at: string | null };
export type PlatformPeriod = Period & { platform: string };
export type Segment = Period & { distance_miles: number; category: 'business' | 'personal'; excluded: boolean; platform_client_id: string | null };
export type Snapshot = Period & { revision: number; planned_end_at: string | null; platform_sessions: PlatformPeriod[]; segments: Segment[] };
type Detector = { last?: LocationPoint; start?: number; movingSince?: number; stoppedSince?: number; miles: number; driving: boolean };
export type Entry = { owner: string; data: Snapshot; local: boolean; dirty: boolean; sequence: number; pending?: { data: Snapshot; sequence: number }; detector: Detector };
type Journal = { version: 1; recording: { owner: string; clientId: string } | null; entries: Entry[] };
const KEY = '@deduckly/shift-journal:v1';
export const DETECTION = { speed: 3, sustainedMs: 15_000, stopMs: 120_000, gapMs: 120_000, minimumMiles: .05, accuracy: 50 };
let queue: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();
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
async function write(j: Journal) { await AsyncStorage.setItem(KEY, JSON.stringify(j)); listeners.forEach(fn => fn()); }
function touch(e: Entry) { e.dirty = true; e.sequence++; }
function active(j: Journal, owner: string) { return j.entries.find(e => e.owner === owner && e.local && !e.data.ended_at); }
export function listShifts(owner: string) { return serial(async () => (await read()).entries.filter(e => e.owner === owner)); }
export function activeShift(owner: string) { return serial(async () => active(await read(), owner) ?? null); }
export function recordingShift() { return serial(async () => { const j = await read(); return j.entries.find(e => e.data.client_id === j.recording?.clientId && e.owner === j.recording?.owner && e.local && !e.data.ended_at) ?? null; }); }
function finishSegment(e: Entry, end: number) {
  const d = e.detector;
  if (d.driving && d.start && d.miles >= DETECTION.minimumMiles) {
    const p = e.data.platform_sessions.find(p => !p.ended_at);
    e.data.segments.push({ client_id: id(), started_at: iso(d.start), ended_at: iso(end), distance_miles: Math.round(d.miles * 100) / 100, category: 'personal', excluded: false, platform_client_id: p?.client_id ?? null });
    touch(e);
  }
  e.detector = { miles: 0, driving: false };
}
export function setShiftRecording(owner: string | null) { return serial(async () => {
  const j = await read(); const target = owner ? active(j, owner) : undefined;
  const old = j.entries.find(e => e.data.client_id === j.recording?.clientId && e.owner === j.recording?.owner);
  if (old && old !== target) finishSegment(old, old.detector.last?.timestamp ?? Date.now());
  if (target?.detector.last && Date.now() - target.detector.last.timestamp > DETECTION.gapMs) finishSegment(target, target.detector.last.timestamp);
  const next = target ? { owner: target.owner, clientId: target.data.client_id } : null;
  if (j.recording !== next || old || target) { j.recording = next; await write(j); }
}); }
export function startShift(owner: string, platform: string | null, planned: string | null) { return serial(async () => {
  const j = await read(); const previous = active(j, owner); if (previous) return previous;
  const now = iso(Date.now());
  const e: Entry = { owner, local: true, dirty: true, sequence: 1, detector: { miles: 0, driving: false }, data: { client_id: id(), revision: 0, started_at: now, ended_at: null, planned_end_at: planned, platform_sessions: platform ? [{ client_id: id(), platform, started_at: now, ended_at: null }] : [], segments: [] } };
  j.entries.push(e); j.recording = { owner, clientId: e.data.client_id }; await write(j); return e;
}); }
export function editShift(owner: string, clientId: string, fn: (e: Entry) => void) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.owner === owner && e.data.client_id === clientId);
  if (!e) throw Error('Shift unavailable'); fn(e); touch(e); await write(j);
}); }
export function switchPlatform(owner: string, clientId: string, platform: string | null) { return editShift(owner, clientId, e => {
  if (e.data.ended_at) throw Error('Shift ended');
  const now = Math.max(Date.now(), e.detector.last?.timestamp ?? 0); finishSegment(e, e.detector.last?.timestamp ?? now);
  e.data.platform_sessions.filter(p => !p.ended_at).forEach(p => { p.ended_at = iso(now); });
  if (platform) e.data.platform_sessions.push({ client_id: id(), platform, started_at: iso(now), ended_at: null });
}); }
export function endShift(owner: string, clientId: string) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.owner === owner && e.data.client_id === clientId);
  if (!e || e.data.ended_at) return;
  const now = Math.max(Date.now(), e.detector.last?.timestamp ?? 0); finishSegment(e, e.detector.last?.timestamp ?? now);
  e.data.ended_at = iso(now); e.data.platform_sessions.filter(p => !p.ended_at).forEach(p => { p.ended_at = iso(now); });
  if (j.recording?.clientId === clientId && j.recording.owner === owner) j.recording = null;
  touch(e); await write(j);
}); }
export function recordShiftPoints(clientId: string, points: LocationPoint[]) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.data.client_id === clientId && e.owner === j.recording?.owner && !e.data.ended_at);
  if (!e || j.recording?.clientId !== clientId) return;
  const cutoff = Math.max(Date.parse(e.data.started_at), ...e.data.platform_sessions.map(p => Date.parse(p.ended_at ?? p.started_at)));
  let changed = false;
  for (const p of [...points].sort((a,b) => a.timestamp-b.timestamp)) {
    if (p.timestamp < cutoff || !validPoint(p) || p.accuracy > DETECTION.accuracy || p.timestamp > Date.now()+60_000 || (e.detector.last && p.timestamp <= e.detector.last.timestamp)) continue;
    let d = e.detector;
    if (d.last && p.timestamp-d.last.timestamp > DETECTION.gapMs) { finishSegment(e, d.last.timestamp); d = e.detector; }
    const miles = d.last ? calculateSegmentDistanceMiles(d.last, p) : 0;
    if (miles === null || !Number.isFinite(miles)) continue;
    const seconds = d.last ? (p.timestamp-d.last.timestamp)/1000 : 0;
    const speed = seconds > 0 ? miles * 1609.344 / seconds : 0;
    if (speed >= DETECTION.speed) {
      d.movingSince ??= d.last?.timestamp ?? p.timestamp; d.start ??= d.movingSince;
      d.stoppedSince = undefined; d.miles += miles;
      if (p.timestamp-d.movingSince >= DETECTION.sustainedMs) d.driving = true;
    } else if (d.driving) {
      d.stoppedSince ??= p.timestamp;
      if (p.timestamp-d.stoppedSince >= DETECTION.stopMs) { finishSegment(e, d.stoppedSince); d = e.detector; }
    } else { d.movingSince = undefined; d.start = undefined; d.miles = 0; }
    d.last = p; changed = true;
  }
  if (changed) await write(j);
}); }
export function prepareShiftUpload(owner: string) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.owner === owner && (e.dirty || e.pending));
  if (!e) return null;
  if (!e.pending) { e.pending = { data: { ...JSON.parse(JSON.stringify(e.data)), revision: e.data.revision+1 }, sequence: e.sequence }; await write(j); }
  return e.pending.data;
}); }
export function acknowledgeShift(owner: string, clientId: string, revision: number) { return serial(async () => {
  const j = await read(); const e = j.entries.find(e => e.owner === owner && e.data.client_id === clientId);
  if (!e?.pending || e.pending.data.revision !== revision) return;
  e.data.revision = revision; e.dirty = e.sequence !== e.pending.sequence; delete e.pending; await write(j);
}); }
export function importShiftHistory(owner: string, snapshots: Snapshot[]) { return serial(async () => {
  const j = await read();
  for (const data of snapshots) {
    if (j.entries.some(e => e.owner === owner && e.data.client_id === data.client_id)) continue;
    j.entries.push({ owner, data, local: false, dirty: false, sequence: 0, detector: { miles: 0, driving: false } });
  }
  await write(j);
}); }
