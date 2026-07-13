import { router } from "expo-router";
import { useAuth } from "@/features/auth/context/auth.context";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { View, Text, Button, Pressable } from "react-native";

export default function SettingsScreen() {
  const { data: user } = useCurrentUser();

  const { signOut } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Settings</Text>
      <View style={{ backgroundColor: "lightgray", padding: 10, marginVertical: 10 }}>
        <Pressable onPress={() => router.push("/settings/UserUpdateScreen") }>
          <Text>{user?.first_name} {user?.last_name}</Text>
          <Text>{user?.email}</Text>
        </Pressable>
      </View>
      <View style={{ backgroundColor: "lightgray", padding: 10, marginVertical: 10 }}>
        <Pressable onPress={() => { }}>
          <Text>PREMIUM</Text>
          <Text>Upgrade to Premium</Text>
        </Pressable>
      </View>
      <View style={{ backgroundColor: "lightgray", padding: 10, marginVertical: 10 }}>
        <Text>TAX SETTINGS</Text>
        <Pressable onPress={() => { }}>
          <Text>Mileage Rate</Text>
          <Text>{currentYear} IRS Standard(fixed)</Text>
        </Pressable>
      </View>
      <View style={{ backgroundColor: "lightgray", padding: 10, marginVertical: 10 }}>
        <Text>SECURITY SETTINGS</Text>
        <Button
          title="Security"
          onPress={() => { router.push("/settings/security"); }}
        />
      </View>
      <View style={{ backgroundColor: "lightgray", padding: 10, marginVertical: 10 }}>
        <Text>LEGAL</Text>
        <Pressable onPress={() => { }}>
          <Text>Legal</Text>
          <Text>Terms of Service</Text>
        </Pressable>
      </View>
      <View>
        <Button title="Logout" onPress={signOut} />
      </View>
      <Text>Version 1.0.0</Text>
    </View>
  );
}

