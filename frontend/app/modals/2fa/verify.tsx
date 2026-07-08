import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    Modal,
    Pressable
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verify2FA } from "@/features/auth/api/auth.api";

export default function TwoFAVerifyScreen() {
    const [code, setCode] = useState("");
    const queryClient = useQueryClient();

    const verify2FAMutation = useMutation({
        mutationFn: verify2FA,

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["current-user"] });

            router.replace("/modals/2fa/enabled");
        },
        onError: (error) => {
            Alert.alert(
                "The code you entered is incorrect. Please try again."
            );
        }
    });

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 24
            }}
        >
        <TextInput
            value={code}
            onChangeText={setCode}
            maxLength={6}
            placeholder="Enter 2FA code"
            keyboardType="number-pad"
            style={{
                borderWidth: 1,
                borderColor: "gray",
                padding: 12,
                marginVertical: 20,
                borderRadius: 5
            }}
        />
        <Button
            title={
                verify2FAMutation.isPending ? "Verifying..." : "Verify and Enable"
            }
            onPress={() => verify2FAMutation.mutate(code)}
        />
        <Button
        title="Cancel"
        onPress={() => router.dismissAll()}
        />
    </View>
    );
}
