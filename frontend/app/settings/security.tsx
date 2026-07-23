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
            <View>
        {/* {icon} */}
        <View>
          <Text>
            Keep your account secure
          </Text>
          <Text>
            We recommend using a strong password
            and enabling 2FA to protect your account.
          </Text>
        </View>
      </View>
            

        </View>
    </View>

    );
}
