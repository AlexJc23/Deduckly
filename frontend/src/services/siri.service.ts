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

export async function getPendingStop(): Promise<boolean> {
  if (!SiriBridge) {
    return false;
  }

  return await SiriBridge.getPendingStop();
}

export async function getPendingCancel(): Promise<boolean> {
  if (!SiriBridge) {
    return false;
  }

  return await SiriBridge.getPendingCancel();
}