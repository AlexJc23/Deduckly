import React from "react"
import { BackHeader } from "@/components/ui/BackButton";
import {
    View,
    Text,
    Pressable
} from 'react-native'
import {router} from "expo-router"

export default function LegalScreen() {
    return (
        <View>
            <BackHeader />
            <View>
                <Pressable onPress={() => {router.push("/settings/legal/sections/terms-of-service")}}>
                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    <View>
                        <Text style={{ fontWeight: "bold" }}>Terms of Service</Text>
                        <Text>
                            Defines the rules and conditions
                            for using our app.
                        </Text>
                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    </View>
                </Pressable>
                <Pressable onPress={() => router.push("/settings/legal/sections/EULA")}>
                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    <View>
                        <Text style={{ fontWeight: "bold" }}>End User License Agreement </Text>
                        <Text>
                            
                        </Text>
                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    </View>
                </Pressable>
                <Pressable onPress={() => router.push("/settings/legal/sections/account-data-deletion")}>
                
                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    <View>
                        <Text style={{ fontWeight: "bold" }}>Data Deletion Information</Text>
                        <Text>
                           
                        </Text>
                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    </View>
                </Pressable>
                <Pressable onPress={() => router.push("/settings/legal/sections/third-party-notice")}>

                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    <View>
                        <Text style={{ fontWeight: "bold" }}>Third-Party Notices</Text>
                        <Text>
                            
                        </Text>
                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    </View>
                </Pressable>
                <Pressable onPress={() => router.push("/settings/privacy/sections/privacy-policy")}>

                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    <View>
                        <Text style={{ fontWeight: "bold" }}>Privacy Policy</Text>
                        <Text>
                            
                        </Text>
                    <View>
                        {/* <Text>{icon}</Text> */}
                    </View>
                    </View>
                </Pressable>
                
            </View>

        </View>

    );
}