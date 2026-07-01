import * as Location from "expo-location"
import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect
} from "react";

import {
  getCurrentLocation,
  LocationPoint,
  requestLocationPermission,
  watchLocation,
} from "../services/location.service";

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


  startTracking: (
    data: StartTrackingData
  ) => Promise<void>;

  stopTracking: () => void;
};

const TrackingContext =
  createContext<
    TrackingContextType | undefined
  >(undefined);

export function TrackingProvider({
  children,
}: {
  route: LocationPoint[];
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

    const [route, setRoute] = useState<LocationPoint[]>([]);
    useEffect(() => {
      console.log("Points", route)
      console.log("Points", route.length)
    }, [route])

    const [distanceMiles, setDistanceMiles] =
      useState(0);

    const locationSubscription =
    useRef<Location.LocationSubscription | null>(null);

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
      await watchLocation(
        (location) => {
          const {
            latitude,
            longitude,
          } = location.coords

          setCurrentLatitude(latitude);
          setCurrentLongitude(longitude)

          setRoute((previous) => [
            ...previous,
            {
              latitude,
              longitude,
              timestamp: Date.now(),
            },
          ]);
        }

      );

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

  const stopTracking = () => {
    locationSubscription.current?.remove();

    locationSubscription.current = null;

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
