import { api } from "@/api/client";
import { Trip, TripUpdate } from "../types/trips.types";
import { TripCreate } from "../types/trips.types"

export async function getTrips(
    startDate?: string,
    endDate?: string,
    sort: "asc" | "desc" = "desc"
) {
    const response = await api.get(`/api/v1/trips/`, {
        params: {
            start_date: startDate,
            end_date: endDate,
            sort
        },
    });

    return response.data
}

export async function getTrip(
    id: number
): Promise<Trip> {
    const response = await api.get(
        `/api/v1/trips/${id}`
    );

    return response.data
}

export async function createTrip(
    trip: TripCreate
) {
    const response = await api.post(
        `/api/v1/trips/`,
        trip
    );
    return response.data
}

export async function updateTrip(
  tripId: number,
  trip: TripUpdate
) {
  try {
    const response = await api.put(
      `/api/v1/trips/${tripId}`,
      trip
    );

    return response.data;
  } catch (error: any) {
    console.log("========== UPDATE ==========");
    console.log("Trip ID:", tripId);
    console.log(
      "Payload:",
      JSON.stringify(trip, null, 2)
    );
    console.log(
      "Status:",
      error.response?.status
    );
    console.log(
      "Response:",
      JSON.stringify(
        error.response?.data,
        null,
        2
      )
    );
    console.log("============================");

    throw error;
  }
}
export async function deleteTrip(
    id: number
) {
    const response = await api.delete(
        `api/v1/trips/${id}`
    );
    return response.data;
}
