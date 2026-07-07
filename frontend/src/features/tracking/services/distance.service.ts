import { getDistance } from "geolib";
import { LocationPoint } from "./location.service";

export function calculateDistanceMiles(
    route: LocationPoint[]
) : number {
    if (route.length < 2) {
        return 0;
    }

    let totalMeters = 0;

    for (let i = 1; i < route.length; i++) {

        totalMeters += getDistance(
            {
                latitude: route[i - 1].latitude,
                longitude: route[i - 1].longitude
            },
            {
                latitude: route[i].latitude,
                longitude: route[i].longitude
            }
        );
    }
    return totalMeters / 1609.344
}
