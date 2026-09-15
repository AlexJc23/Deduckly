import { Linking, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { localizedAlert } from "@/i18n/alerts";
import { savePushToken } from "@/api/notification";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotifications(): Promise<string> {
    if (!Device.isDevice) {
        throw new Error(
            "Push notifications require a physical device."
        );
    }

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    const permission =
        await Notifications.getPermissionsAsync();

    const existingStatus = permission.status;
    if (Platform.OS === "ios" && !permission.granted && (existingStatus === "denied" || !permission.canAskAgain)) {
        localizedAlert("Notifications are off", "You can change notification access in Settings.",
            [{ text: "Cancel", style: "cancel" }, { text: "Open Settings", onPress: () => { void Linking.openSettings().catch(() => {}); } }]);
        throw new Error("Notification permission was denied.");
    }
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } =
            await Notifications.requestPermissionsAsync();

        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        throw new Error(
            "Notification permission was denied."
        );
    }

    const token = await Notifications.getExpoPushTokenAsync();

    await savePushToken(token.data);

    return token.data;
}

// Refresh registration without prompting. The server owns all reminder schedules.
export async function syncNotificationRegistration(isCurrent: () => boolean = () => true) {
    if (Platform.OS === "web" || !Device.isDevice) return;
    const permission = await Notifications.getPermissionsAsync();
    if (!isCurrent()) return;
    if (!permission.granted) {
        await savePushToken(null);
        return;
    }
    const token = await Notifications.getExpoPushTokenAsync();
    if (isCurrent()) await savePushToken(token.data);
}
