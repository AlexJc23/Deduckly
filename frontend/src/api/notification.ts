import { api } from "./client";
import * as SecureStore from "expo-secure-store";
import { getAccountGeneration, isAccountChanging } from "@/features/auth/services/account-boundary";

const PUSH_TOKEN_KEY = "deduckly_push_destination";
let writes: Promise<unknown> = Promise.resolve();
let signingOutGeneration: number | null = null;

export async function prepareNotificationLogout() {
    signingOutGeneration = getAccountGeneration();
    // Finish in-flight registration before unregistering; reject later callbacks.
    await writes.catch(() => {});
    return SecureStore.getItemAsync(PUSH_TOKEN_KEY);
}

export function savePushToken(expoPushToken: string | null) {
    const generation = getAccountGeneration();
    const operation = writes.then(async () => {
        if (isAccountChanging() || generation !== getAccountGeneration() || signingOutGeneration === generation) return;
        // Save before POST so a lost registration response can still be unregistered.
        if (expoPushToken) await SecureStore.setItemAsync(PUSH_TOKEN_KEY, expoPushToken);
        const response = await api.post(
            "/api/v1/notifications/push-token",
            { expo_push_token: expoPushToken, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            { deducklyGeneration: generation }
        );
        return response.data;
    });
    writes = operation.catch(() => {});
    return operation;
}
