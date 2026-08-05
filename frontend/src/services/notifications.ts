import * as Device from "expo-device";
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

export async function registerForPushNotifications(): Promise<string> {
    if (!Device.isDevice) {
        throw new Error(
            "Push notifications require a physical device."
        );
    }

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

    const token = await Notifications.getExpoPushTokenAsync();

    await savePushToken(token.data);

    return token.data;
}