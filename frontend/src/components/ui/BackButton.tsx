import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export function BackHeader() {
  return (
    <View
      style={{
        height: 110,
        backgroundColor: "#4A6FE3",
        paddingTop: 55,
        paddingHorizontal: 15,
      }}
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}