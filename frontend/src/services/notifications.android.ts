import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

import { savePushToken } from "@/api/notification";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

async function ensureChannel() {
    await Notifications.setNotificationChannelAsync("default", {
        name: "Deduckly reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
    });
}
async function getPushToken() {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) throw new Error("Android push registration requires the Expo project ID.");
    // Android also requires this app's Firebase config and EAS FCM credentials.
    return Notifications.getExpoPushTokenAsync({ projectId });
}

export async function registerForPushNotifications(): Promise<string> {
    await ensureChannel();

    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

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

    const token = await getPushToken();

    await savePushToken(token.data);

    return token.data;
}

// Refresh registration without prompting. The server owns all reminder schedules.
export async function syncNotificationRegistration(isCurrent: () => boolean = () => true) {
    await ensureChannel();
    const permission = await Notifications.getPermissionsAsync();
    if (!isCurrent()) return;
    if (!permission.granted) {
        await savePushToken(null);
        return;
    }
    const token = await getPushToken();
    if (isCurrent()) await savePushToken(token.data);
}
