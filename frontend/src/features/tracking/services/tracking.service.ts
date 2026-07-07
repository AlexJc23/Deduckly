import { TripCreate } from "@features/trips/types/trips.types"
import { platform } from "process";

type BuildTripPayloadParams = {
  startTime: Date;
  endTime: Date;

  distanceMiles: number;

  startLatitude: number;
  startLongitude: number;

  endLatitude: number;
  endLongitude: number;

  start_address: string | null;
  end_address: string | null;

  category: string;

  platform: string | " ";
};

export function buildTripPayload({
  startTime,
  endTime,
  distanceMiles,
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude,
  start_address: startAddress,
  end_address: endAddress,
  category,
  platform,
}: BuildTripPayloadParams): TripCreate {
  const payloadPlatform = category === "personal" ? "PERSONAL" : platform;

  return {
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),

    distance_miles: distanceMiles,

    start_lat: startLatitude,
    start_lng: startLongitude,

    end_lat: endLatitude,
    end_lng: endLongitude,

    start_address: startAddress,
    end_address: endAddress,

    category,
    platform,

    income_amount: null,
  };
}
