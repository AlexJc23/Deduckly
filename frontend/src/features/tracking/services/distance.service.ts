import { getDistance } from "geolib";
import { LocationPoint } from "./location.service";

/**
 * GPS tuning values.
 *
 * Keep these in one place so they're easy to adjust after
 * real-world testing.
 */
const MAX_REASONABLE_SPEED_MPH = 100;

const METERS_PER_MILE = 1609.344;

export function calculateSegmentDistanceMiles(
  previous: LocationPoint,
  current: LocationPoint
): number | null {
  const distanceMeters = getDistance(
    {
      latitude: previous.latitude,
      longitude: previous.longitude,
    },
    {
      latitude: current.latitude,
      longitude: current.longitude,
    }
  );

  const elapsedSeconds =
    (current.timestamp - previous.timestamp) /
    1000;

  if (elapsedSeconds > 0) {
    const speedMph =
      (distanceMeters / elapsedSeconds) *
      2.236936;

    if (speedMph > MAX_REASONABLE_SPEED_MPH) {
      return null;
    }
  }

  return distanceMeters / METERS_PER_MILE;
}

/**
 * Calculate total trip mileage from the GPS points collected
 * during the trip.
 */
export function calculateDistanceMiles(
  route: LocationPoint[]
): number {
  if (route.length < 2) {
    return 0;
  }

  let totalMiles = 0;
  let lastValidPoint = route[0];

  for (let i = 1; i < route.length; i++) {
    const current = route[i];

    const segmentMiles =
      calculateSegmentDistanceMiles(
        lastValidPoint,
        current
      );

    if (segmentMiles === null) {
      // GPS is going to GPS. Don't let one bad jump ruin the trip.
      continue;
    }

    totalMiles += segmentMiles;
    lastValidPoint = current;
  }

  return totalMiles;
}