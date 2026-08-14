import * as Location from "expo-location"

export async function requestLocationPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    return status === "granted";
}


export async function getCurrentLocation() {
    return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
    });
}



export async function watchLocation(
    callback: (location: Location.LocationObject) => void
) {

    return await Location.watchPositionAsync(

        {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 1,
            timeInterval: 3000,
        },
        callback
    );
}

export type LocationPoint = {
    latitude: number;
    longitude: number;
    timestamp: number;
};


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
