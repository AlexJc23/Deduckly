import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#22C55E",
      tabBarInactiveTintColor: "#9CA3AF"
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Dashboard" }}
      />

      <Tabs.Screen
        name="trips"
        options={{ title: "Trips" }}
      />

      <Tabs.Screen
        name="reports"
        options={{ title: "Reports" }}
      />

      <Tabs.Screen
        name="settings"
        options={{ title: "Settings" }}
      />

    </Tabs>
  );
}
