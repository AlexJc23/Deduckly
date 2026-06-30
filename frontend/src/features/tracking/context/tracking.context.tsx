import {
  createContext,
  useContext,
  useState,
} from "react";

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

  startTracking: (
    data: StartTrackingData
  ) => void;

  stopTracking: () => void;
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

  const startTracking = ({
    category,
    platform,
    trackingMethod,
  }: StartTrackingData) => {
    setCategory(category);
    setPlatform(platform);
    setTrackingMethod(trackingMethod);

    setStartTime(new Date());
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);

    setStartTime(null);
    setTrackingMethod(null);
    setCategory(null);
    setPlatform(null);
  };

  return (
    <TrackingContext.Provider
      value={{
        isTracking,

        trackingMethod,

        category,
        platform,

        startTime,

        startTracking,
        stopTracking,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);

  if (!context) {
    throw new Error(
      "TrackingContext missing"
    );
  }

  return context;
}
