import type { LocationPoint } from '@/features/tracking/services/location.service';
import { calculateSegmentDistanceMiles } from '@/features/tracking/services/distance.service';

// Shift-only tuning. Manual/Siri Trip mileage filtering is unchanged.
export const DETECTION = {
  speed: 3, sustainedMs: 15_000, stopMs: 6 * 60_000, gapMs: 120_000,
  minimumMiles: .05, accuracy: 50, boundaryAccuracy: 25,
  bufferMs: 90_000, bufferPoints: 90, sampleMs: 5_000, quietHopMs: 30_000,
  startMeters: 45, resumeMeters: 30, resumeSpeed: .7,
  minimumHopMeters: 8, accuracyMultiplier: 1.5, uncertaintyMultiplier: 2, directionRatio: .6,
  futureSkewMs: 60_000,
  stopSpeed: 1.5, nativeStillSpeed: .3, stopRadiusMeters: 25, stopSamples: 12,
};
const METERS_PER_MILE = 1609.344;
export type Detector = {
  first?: LocationPoint; endpoint?: LocationPoint; stopPoint?: LocationPoint;
  last?: LocationPoint; start?: number; movingSince?: number; stoppedSince?: number;
  miles: number; driving: boolean;
  recent?: LocationPoint[]; anchor?: LocationPoint; stopSamples?: number;
};
const meters = (a: LocationPoint, b: LocationPoint) => {
  const miles = calculateSegmentDistanceMiles(a, b);
  return miles === null ? null : miles * METERS_PER_MILE;
};
const noise = (a: LocationPoint, b: LocationPoint) => Math.max(DETECTION.minimumHopMeters, DETECTION.accuracyMultiplier * Math.max(a.accuracy, b.accuracy));
const reportedStopped = (p: LocationPoint) => !Number.isFinite(p.speed) || p.speed < 0 || p.speed <= DETECTION.stopSpeed;

function remember(d: Detector, p: LocationPoint) {
  d.recent = [...(d.recent ?? []).filter(x => p.timestamp - x.timestamp <= DETECTION.bufferMs), p].slice(-DETECTION.bufferPoints);
}
// Inspect a bounded suffix, not simply the oldest buffered sample. Require
// both consistent hops and net movement beyond endpoint GPS uncertainty.
// Five-second hops support 1 Hz GPS without trusting individual noisy points.
function movement(d: Detector, speed: number, minimumMeters: number) {
  const samples = d.recent ?? [];
  const latest = samples.at(-1);
  if (!latest) return null;
  let first: LocationPoint | undefined, distance = 0, next = latest;
  for (let i = samples.length - 2; i >= 0; i--) {
    const a = samples[i], elapsed = next.timestamp-a.timestamp;
    if (elapsed < DETECTION.sampleMs) continue;
    const hop = meters(a,next);
    // Accumulate small real displacements over a longer hop for slow queues.
    // Bounded quiet hops stop us selecting an unrelated old stationary point.
    if (hop !== null && hop < DETECTION.minimumHopMeters && elapsed < DETECTION.quietHopMs) continue;
    const nativeStill = [a,next].every(p => Number.isFinite(p.speed) && p.speed >= 0 && p.speed <= DETECTION.nativeStillSpeed);
    if (hop === null || hop < DETECTION.minimumHopMeters || hop / (elapsed/1000) < speed || nativeStill) break;
    first = a; distance += hop; next = a;
  }
  if (!first) { d.movingSince = undefined; return null; }
  const displacement = meters(first, latest);
  if (displacement === null || displacement / distance < DETECTION.directionRatio) { d.movingSince = undefined; return null; }
  d.movingSince = first.timestamp;
  if (latest.timestamp-first.timestamp < DETECTION.sustainedMs || displacement < Math.max(minimumMeters, noise(first,latest)*DETECTION.uncertaintyMultiplier)) return null;
  return { first, distance };
}
function clearStop(d: Detector) {
  d.stopPoint = undefined; d.stoppedSince = undefined; d.stopSamples = 0;
}
function possibleStop(d: Detector, p: LocationPoint) {
  d.stopPoint = p; d.stoppedSince = p.timestamp; d.stopSamples = 1;
  d.endpoint = p; d.anchor = p; d.recent = [p]; d.movingSince = undefined;
}

function stationaryEvidence(d: Detector, p: LocationPoint): boolean {
  if (!d.stopPoint) { possibleStop(d,p); return false; }
  const radius = Math.max(DETECTION.stopRadiusMeters, noise(d.stopPoint,p));
  const displacement = meters(d.stopPoint,p);
  if (displacement === null || displacement > radius || !reportedStopped(p)) {
    d.stoppedSince = undefined; d.stopSamples = 0;
    // If slow creeping relocates the car, don't keep an obsolete endpoint.
    if (displacement !== null && displacement > radius && reportedStopped(p) && !d.movingSince) possibleStop(d,p);
    return false;
  }
  d.stoppedSince ??= p.timestamp;
  d.stopSamples = (d.stopSamples ?? 0)+1;
  return p.timestamp-d.stoppedSince >= DETECTION.stopMs && d.stopSamples >= DETECTION.stopSamples;
}

/** Returns true only on observed, confirmed stopping; caller finalizes atomically. */
export function observeShiftPoint(d: Detector, p: LocationPoint, awaitingLegacyStop = false): boolean {
  if (d.last && p.timestamp-d.last.timestamp > DETECTION.gapMs) {
    // Neither join unseen mileage nor infer a stop from silence. Preserve the
    // active segment across suspension and re-anchor on the next real fix.
    d.recent = []; d.anchor = undefined; d.movingSince = undefined; clearStop(d);
    if (!d.driving) { d.first = undefined; d.start = undefined; d.miles = 0; }
  }
  if (p.accuracy > DETECTION.boundaryAccuracy) {
    // Poor fixes cannot accumulate stationary evidence or move a boundary.
    d.stoppedSince = undefined; d.stopSamples = 0; d.recent = [];
    d.anchor = undefined; d.movingSince = undefined;
    return false;
  }
  remember(d,p);
  if (!d.driving) {
    const run = movement(d, DETECTION.speed, DETECTION.startMeters);
    if (run) {
      d.first = run.first; d.start = run.first.timestamp; d.driving = true;
      d.miles = run.distance / METERS_PER_MILE; d.anchor = p; d.endpoint = p;
      d.recent = [p]; clearStop(d);
    } else if (awaitingLegacyStop && !d.movingSince && reportedStopped(p)) {
      return stationaryEvidence(d,p);
    }
    return false;
  }
  if (d.stopPoint) {
    const run = movement(d, DETECTION.resumeSpeed, DETECTION.resumeMeters);
    if (run) {
      // Replay only confirmed resumed movement once, never stationary wandering.
      d.miles += run.distance / METERS_PER_MILE; d.anchor = p; d.endpoint = p;
      d.recent = [p]; clearStop(d); d.movingSince = undefined;
      return false;
    }
    return stationaryEvidence(d,p);
  }
  const anchor = d.anchor;
  if (!anchor) {
    d.anchor = p;
    if (reportedStopped(p)) possibleStop(d,p);
    return false;
  }
  const distance = meters(anchor,p);
  if (distance === null) return false;
  if (distance >= noise(anchor,p)) {
    d.miles += distance / METERS_PER_MILE; d.anchor = p; d.endpoint = p;
  }
  const previous = d.last;
  const step = previous ? meters(previous,p) : null;
  const inferredSpeed = previous && step !== null ? step / ((p.timestamp-previous.timestamp)/1000) : Infinity;
  // A native zero-speed arrival point is useful even when its incoming edge
  // contains driving. Without native speed, require small measured displacement.
  const nativeStop = Number.isFinite(p.speed) && p.speed >= 0 && p.speed <= DETECTION.stopSpeed;
  if (reportedStopped(p) && (nativeStop || inferredSpeed <= DETECTION.stopSpeed)) possibleStop(d,p);
  return false;
}
