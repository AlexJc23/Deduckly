import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    Modal,
    Pressable
} from "react-native";

import { router, Stack } from "expo-router";

export default function twoFAStartScreen() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 24
            }}
        >
            <Pressable onPress={() => router.back()}>
                <Text>Back</Text>
            </Pressable>
            
            <Text> Hello World!</Text>
            <Button title="Enable 2FA" onPress={() => {
                router.push("/modals/2fa/scan");
            }} />


        </View>
    );
}
