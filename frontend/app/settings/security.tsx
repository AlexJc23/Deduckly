import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    Modal,
    Pressable
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
    useCurrentUser
} from "@/features/auth/hooks/use-current-user";
import { router } from "expo-router";


export default function SecuritySettingsScreen() {
    const { data: user } = useCurrentUser();

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Button title="Back to Settings" onPress={() => router.push("/(tabs)/settings")} />
            <Text>Security Settings</Text>


            <Button
                title="Change Password"
                onPress={() => Alert.alert("Change Password", "This feature is not implemented yet.")}
            />
            <Button
                title="Two-Factor Authentication"
                onPress={() => {
                    if (user?.two_fa_enabled) {
                        router.push("/modals/2fa/enabled");
                    } else {
                        router.push(
                            "/modals/2fa/start"
                        )
                    }
                }}
            />

        </View>
    );
}
