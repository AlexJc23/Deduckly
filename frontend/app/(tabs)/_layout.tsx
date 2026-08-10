import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#4A6FE3",
        tabBarInactiveTintColor: "#64748B",

        tabBarStyle: styles.tabBar,

        tabBarItemStyle: styles.tabBarItem,

        tabBarLabelStyle: styles.tabBarLabel,

        tabBarIconStyle: styles.tabBarIcon,

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "list"
                  : "list-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "bar-chart"
                  : "bar-chart-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "settings"
                  : "settings-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 84,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    elevation: 0,
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -4,
    },
  },

  tabBarItem: {
    paddingVertical: 2,
  },

  tabBarIcon: {
    marginBottom: 2,
  },

  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});