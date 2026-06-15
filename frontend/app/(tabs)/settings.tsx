import { useAuth } from "@/features/auth/context/auth.context";
import { View, Text, Button } from "react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Settings</Text>
      <Button title="Logout" onPress={signOut} />
    </View>
  );
}
