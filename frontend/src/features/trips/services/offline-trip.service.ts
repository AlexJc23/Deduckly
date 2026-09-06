import AsyncStorage from "@react-native-async-storage/async-storage";

import { TripCreate } from "../types/trips.types";

const PENDING_TRIPS_KEY = "@deduckly/pending-trips";

type PendingTrip = {
  id: string;
  payload: TripCreate;
  createdAt: string;
};

async function getStoredTrips(): Promise<PendingTrip[]> {
  const stored = await AsyncStorage.getItem(
    PENDING_TRIPS_KEY
  );

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export async function savePendingTrip(
  payload: TripCreate
): Promise<string> {
  const trips = await getStoredTrips();

  const id = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const pendingTrip: PendingTrip = {
    id,
    payload,
    createdAt: new Date().toISOString(),
  };

  trips.push(pendingTrip);

  await AsyncStorage.setItem(
    PENDING_TRIPS_KEY,
    JSON.stringify(trips)
  );

  return id;
}

export async function getPendingTrips(): Promise<
  PendingTrip[]
> {
  return getStoredTrips();
}

export async function removePendingTrip(
  id: string
): Promise<void> {
  const trips = await getStoredTrips();

  const remainingTrips = trips.filter(
    (trip) => trip.id !== id
  );

  await AsyncStorage.setItem(
    PENDING_TRIPS_KEY,
    JSON.stringify(remainingTrips)
  );
}

export async function debugPendingTrips(): Promise<void> {
  const stored = await AsyncStorage.getItem(PENDING_TRIPS_KEY);

  console.log("========== PENDING TRIPS ==========");
  console.log(stored);
  console.log("===================================");
}