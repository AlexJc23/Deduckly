import * as Location from "expo-location";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

import {
  getCurrentLocation,
  LocationPoint,
  requestLocationPermission,
  watchLocation,
  reverseGeocode
} from "../services/location.service";

import { calculateDistanceMiles } from "../services/distance.service";
import { createTrip } from "@/features/trips/api/trips.api";
import { buildTripPayload } from "../services/tracking.service";

type TrackingMethod =
  | "automatic"
  | "manual"
  | null;

type StartTrackingData = {
  category: string;
  platform: string | null;
  trackingMethod: TrackingMethod;
};

type TrackingContextType = {
  isTracking: boolean;

  trackingMethod: TrackingMethod;

  category: string | null;
  platform: string | null;

  startTime: Date | null;

  startLatitude: number | null;
  startLongitude: number | null;

  currentLatitude: number | null;
  currentLongitude: number | null;

  distanceMiles: number;

  startTracking: (
    data: StartTrackingData
  ) => Promise<void>;

  stopTracking: (incomeAmount?: number | null) => Promise<boolean>;
};

const TrackingContext =
  createContext<
    TrackingContextType | undefined
  >(undefined);

export function TrackingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTracking, setIsTracking] =
    useState(false);

  const [trackingMethod, setTrackingMethod] =
    useState<TrackingMethod>(null);

  const [category, setCategory] =
    useState<string | null>(null);

  const [platform, setPlatform] =
    useState<string | null>(null);

  const [startTime, setStartTime] =
    useState<Date | null>(null);

  const [startLatitude, setStartLatitude] =
    useState<number | null>(null);

  const [startLongitude, setStartLongitude] =
    useState<number | null>(null);

  const [currentLatitude, setCurrentLatitude] =
    useState<number | null>(null);

  const [currentLongitude, setCurrentLongitude] =
    useState<number | null>(null);

  const [route, setRoute] =
    useState<LocationPoint[]>([]);

  const [distanceMiles, setDistanceMiles] =
    useState(0);

  useEffect(() => {
    setDistanceMiles(
      calculateDistanceMiles(route)
    );
  }, [route]);

  const locationSubscription =
    useRef<Location.LocationSubscription | null>(
      null
    );

  const startTracking = async ({
    category,
    platform,
    trackingMethod,
  }: StartTrackingData) => {
    const granted =
      await requestLocationPermission();

    if (!granted) {
      return;
    }

    const location =
      await getCurrentLocation();

    const {
      latitude,
      longitude,
    } = location.coords;

    setRoute([
      {
        latitude,
        longitude,
        timestamp: Date.now(),
      },
    ]);

    locationSubscription.current =
      await watchLocation((location) => {
        const {
          latitude,
          longitude,
        } = location.coords;

        setCurrentLatitude(latitude);
        setCurrentLongitude(longitude);

        setRoute((previous) => [
          ...previous,
          {
            latitude,
            longitude,
            timestamp: Date.now(),
          },
        ]);
      });

    setCategory(category);
    setPlatform(platform);
    setTrackingMethod(trackingMethod);

    setStartLatitude(latitude);
    setStartLongitude(longitude);

    setCurrentLatitude(latitude);
    setCurrentLongitude(longitude);

    setStartTime(new Date());

    setIsTracking(true);
  };

  const stopTracking = async (
    incomeAmount?: number | null
  ) => {


    locationSubscription.current?.remove();
    locationSubscription.current = null;

    if (
      !startTime ||
      startLatitude === null ||
      startLongitude === null ||
      currentLatitude === null ||
      currentLongitude === null ||
      !category
    ) {
      return false;
    }


    const startAddress = startLatitude && startLongitude
    ? await reverseGeocode(
      startLatitude,
      startLongitude
    )
    : null;

    const endAddress =
    currentLatitude && currentLongitude
    ? await reverseGeocode(
      currentLatitude,
      currentLongitude
    )
    : null;

    console.log("Start ", startAddress);
    console.log("End", endAddress)


    const payload = await buildTripPayload({
      startTime,
      endTime: new Date(),

      distanceMiles,

      startLatitude,
      startLongitude,

      endLatitude: currentLatitude,
      endLongitude: currentLongitude,

      start_address: startAddress,
      end_address: endAddress,

      category,
      platform: "personal",

    });

    try {
      console.log(
        JSON.stringify(payload, null, 2)
      )
      await createTrip(payload);

      setIsTracking(false);

      setStartTime(null);

      setTrackingMethod(null);
      setCategory(null);
      setPlatform(null);

      setStartLatitude(null);
      setStartLongitude(null);

      setCurrentLatitude(null);
      setCurrentLongitude(null);

      setRoute([]);
      setDistanceMiles(0);

      return true;
    } catch (error: any) {
  console.log("========== AXIOS ERROR ==========");

  console.log("Status:", error.response?.status);

  console.log(
    "Data:",
    JSON.stringify(error.response?.data, null, 2)
  );

  console.log("================================");

  return false;
}
  };

  return (
    <TrackingContext.Provider
      value={{
        isTracking,

        trackingMethod,

        category,
        platform,

        startTime,

        startLatitude,
        startLongitude,

        currentLatitude,
        currentLongitude,

        distanceMiles,

        startTracking,
        stopTracking,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context =
    useContext(TrackingContext);

  if (!context) {
    throw new Error(
      "TrackingContext missing"
    );
  }

  return context;
}
