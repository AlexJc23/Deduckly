import { BackHeader } from "@/components/ui/BackButton";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router"
import React from "react"

export default function PrivacyScreen() {

    return (
        <View>
                    <BackHeader />
                    <View>
                        <>
                        <Pressable onPress={() => router.push("/settings/privacy-policy/privacy-policy")}>
                            <Text>
                                Privacy Policy
                            </Text>
                            <Text>
                                Read our policy to understand
                                how we collect, use and protect
                                your data,
                            </Text>
                        </Pressable>
                        </>
        
                    </View>
                </View>
    );
}