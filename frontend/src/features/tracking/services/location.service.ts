import * as Location from "expo-location";

/**
 * Main GPS settings.
 *
 * These are intentionally easy to tune as we test real-world
 * mileage accuracy. Current target is roughly +/- 3%.
 */
const LOCATION_TIME_INTERVAL_MS = 1000;
const LOCATION_DISTANCE_INTERVAL_METERS = 0;

export async function requestLocationPermission() {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  return status === "granted";
}

export async function getCurrentLocation() {
  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });
}

/**
 * start receiving live location updates.
 *
 * Cell service is not required for GPS tracking. Network syncing
 * is handled separately from the active trip.
 */
export async function watchLocation(
  callback: (location: Location.LocationObject) => void,
  onError?: (reason: string) => void
) {
  const subscription =
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval:
          LOCATION_DISTANCE_INTERVAL_METERS,
        timeInterval:
          LOCATION_TIME_INTERVAL_MS,
        mayShowUserSettingsDialog: true,
      },
      callback,
      onError
    );

  return subscription;
}

export type LocationPoint = {
  latitude: number;
  longitude: number;

  // Use Apple's timestamp so we know when the location was recorded.
  timestamp: number;

  // Keep these for smarter mileage filtering/tuning later.
  accuracy: number;
  speed: number;
  heading: number;
};

export function toLocationPoint(
  location: Location.LocationObject
): LocationPoint {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    timestamp: location.timestamp,
    accuracy: location.coords.accuracy ?? -1,
    speed: location.coords.speed ?? -1,
    heading: location.coords.heading ?? -1,
  };
}

/**
 * Reverse geocoding is separate from mileage tracking.
 * If we're offline, failing to get an address should never
 * interrupt an active trip.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
) {
  const results =
    await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

  if (results.length === 0) {
    return null;
  }

  const place = results[0];

  return [
    place.name,
    place.street,
    place.city,
    place.region,
  ]
    .filter(Boolean)
    .join(", ");
}