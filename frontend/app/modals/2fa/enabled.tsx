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
import { disable2FA } from "@/features/auth/api/auth.api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";



export default function twoFAEnabledScreen() {
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    const disableMutation = useMutation({
        mutationFn: disable2FA,

        onSuccess: async () => {

            await queryClient.invalidateQueries({ queryKey: ["current-user"]

            });

            router.replace("/settings/security");
        }
    })

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 24
            }}
        >
            <Text> Two-Factor Authentication is enabled for {user?.email} </Text>
            <Button title="Disable 2FA" onPress={() =>
                disableMutation.mutate()
                }
            />
            <Button title="Back to Security" onPress={() => router.push("/settings/security")} />

        </View>

    )
}
