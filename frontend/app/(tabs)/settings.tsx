import { router } from "expo-router";
import { useAuth } from "@/features/auth/context/auth.context";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { View, Text, Button } from "react-native";

export default function SettingsScreen() {
  const userQuery = useCurrentUser();


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


          <Button
            title="Security"
            onPress={() => {router.push("/settings/security")}}
          />


    </View>
  );
}
