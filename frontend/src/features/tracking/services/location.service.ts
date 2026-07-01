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
            distanceInterval: 5,
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
