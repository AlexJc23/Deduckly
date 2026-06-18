import QRCode from "react-native-qrcode-svg";
import { View, Text, Button, Pressable } from "react-native";
import { router } from "expo-router";
import { useEnable2FA } from "@/features/auth/hooks/use-enable-2fa";
import { useEffect } from "react";
import * as Clipboard from "expo-clipboard";

export default function twoFAScanScreen() {
    const enable2FAMutation = useEnable2FA();

    const copySecret = async () => {
        await Clipboard.setStringAsync(enable2FAMutation.data?.secret)
    };

    useEffect(() => {
        enable2FAMutation.mutate();
    }, []);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 24
            }}
        >
            <QRCode
                value={enable2FAMutation.data?.otpauth_url || "Loading..."}
                size={200}
            />
            <Pressable onPress={copySecret}>
                <Text>
                    {enable2FAMutation.data?.secret || "Loading..."}
                </Text>
            </Pressable>

            <Button title="Next Step" onPress={() => {
                router.push("/modals/2fa/verify");
            }} />
            <Button
            title="Cancel"
            onPress={() => router.push("/settings/security")}
            />
        </View>

    )
}
