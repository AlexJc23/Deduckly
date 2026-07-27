import { View, Text, Pressable } from "react-native";

export default function PremiumHeader() {
    return (
        <View>
            <View>
                <Text>Reports Pro</Text>
                <Text>
                    Powerful inisghts. Tax-ready reports. All in one place.
                </Text>
            </View>
            <Pressable>
                <Text>Export</Text>
            </Pressable>
        </View>
    );
}