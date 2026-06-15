import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/auth.context";

import { verify2FA } from "@/features/auth/api/auth.api";
import { saveTokens } from "@/features/auth/services/auth-service.service"
import { clearTemporaryToken } from "@/features/auth/services/twofa-storage.service";
import { router } from "expo-router";

export default function Verify2FAScreen() {
    const [code, setCode] = useState("");
    const { signIn } = useAuth();

    const verify2FAMutation = useMutation({
        mutationFn: verify2FA,

        onSuccess: async (data) => {
            await saveTokens(
                data.access_token,
                data.refresh_token
            );
            clearTemporaryToken();
            signIn();

            router.replace("/(tabs)/dashboard");
        },
    });

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 24,
            }}
        >
            <Text>Enter your 2FA code:</Text>
            <TextInput
                value={code}
                onChangeText={setCode}
                maxLength={6}
                placeholder="123456"
                keyboardType="number-pad"
                style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 12,
                    marginVertical: 20,
                    borderRadius: 5,
                }}
            />
            <Button
                title={
                    verify2FAMutation.isPending
                    ? "Verifying..."
                    : "Verify"
                }
                onPress={() => verify2FAMutation.mutate(code)}
            />
        </View>
    );
}
