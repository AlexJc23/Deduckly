import {
    View,
    Text,
    Button,
    Alert,
    Pressable
} from "react-native";
import {
    useCurrentUser
} from "@/features/auth/hooks/use-current-user";
import { router } from "expo-router";
import { HeaderBackButton } from "@react-navigation/elements";
import { BackHeader } from "@/components/ui/BackButton";


export default function SecuritySettingsScreen() {
    const { data: user } = useCurrentUser();


    return (
    <View>
        <BackHeader />

        <View
        
        >
            <Button title="Back to Settings" onPress={() => router.back()} />
            

            <View>
                <Button
                    title="Change Password"
                    onPress={() => router.push("/settings/change-password")}
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
            

        </View>
    </View>

    );
}
