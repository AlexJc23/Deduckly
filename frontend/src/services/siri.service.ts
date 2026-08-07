import { NativeModules } from "react-native";

const { SiriBridge } = NativeModules;

export type PendingTrip = {
  platform: string;
} | null;

export async function getPendingTrip(): Promise<PendingTrip> {
  if (!SiriBridge) {
    return null;
  }

  return await SiriBridge.getPendingTrip();
}