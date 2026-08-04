import { api } from "./client";

export async function savePushToken(
    expoPushToken: string
) {
    const response = await api.post(
        "/api/v1/notifications/push-token",
        {
            expo_push_token: expoPushToken,
        }
    );

    return response.data;
}