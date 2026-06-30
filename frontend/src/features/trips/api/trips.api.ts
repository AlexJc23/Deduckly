import { api } from "@/api/client";
import { Trip } from "../types/trips.types";


export async function getTrips(): Promise<Trip[]> {
    const response = await api.get("/api/v1/trips/");

    return response.data;
}

export async function getTrip(
    id: number
): Promise<Trip> {
    const response = await api.get(
        `/api/v1/trips/${id}`
    );

    return response.data
}


export async function deleteTrip(
    id: number
) {
    const response = await api.delete(
        `api/v1/trips/${id}`
    );
    return response.data;
}
