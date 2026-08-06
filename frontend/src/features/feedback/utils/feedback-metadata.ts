import * as Device from "expo-device";
import * as Application from "expo-application";
import { Platform } from "react-native";

export function getFeedbackMetadata() {
  return {
    platform: Platform.OS,
    osVersion: Device.osVersion,
    deviceName: Device.modelName,
    appVersion:
      Application.nativeApplicationVersion,
    buildNumber:
      Application.nativeBuildVersion,
  };
}