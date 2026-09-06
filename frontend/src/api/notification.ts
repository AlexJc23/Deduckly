import { api } from "./client";

export async function savePushToken(
    expoPushToken: string | null
) {
    const response = await api.post(
        "/api/v1/notifications/push-token",
        {
            expo_push_token: expoPushToken,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
    );

    return response.data;
}