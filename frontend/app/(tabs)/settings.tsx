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
        <Pressable onPress={() => router.push("/settings/edit-profile") }>
          <Text>{user?.first_name} {user?.last_name}</Text>
          <Text>{user?.email}</Text>
        </Pressable>
      </View>
      <View>
        {/* {icon} */}
        <View>
          <Text>
            Upgrade to Premium
          </Text>
          <Text>
            Unlock more features and save.
          </Text>
        </View>
        {/* {icon} */}
      </View>
      <View style={{ backgroundColor: "lightgray", padding: 10, marginVertical: 10 }}>
        <Pressable onPress={() => { }}>
          <Text>PREMIUM</Text>
          <Text>Upgrade to Premium</Text>
        </Pressable>
      </View>
      <View style={{ backgroundColor: "lightgray", padding: 10, marginVertical: 10 }}>
        <Text>TAX SETTINGS</Text>
        <Pressable onPress={() => {router.push("/settings/mileage-rate")}}>
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
        <Pressable onPress={() => router.push('/settings/privacy')}>
          <Text>
            Privacy
          </Text>
        </Pressable>
      </View>
      <View style={{ backgroundColor: "lightgray", padding: 10, marginVertical: 10 }}>
        <Text>LEGAL</Text>
        <Pressable onPress={() => {router.push("/settings/legal/legal-screen")}}>
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

