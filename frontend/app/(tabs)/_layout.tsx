import { useLanguage } from "@/i18n/language";
import { useAppTheme } from "@/theme/theme";
import { themedStyle } from "@/theme/components";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";
import { Tabs } from "expo-router";
import { Ionicons } from "@/theme/icons";
import { StyleSheet } from "react-native";
import { useAdaptiveLayout } from '@/hooks/use-adaptive-layout';
import { bottomTabMetrics, sidebarTabItemHeight, tabBarPosition } from '@/hooks/adaptive-layout';

export default function TabsLayout() {
  const { t } = useLanguage();
  const layout = useAdaptiveLayout();
  const position = tabBarPosition(layout, layout.fontScale);
  const isTablet = position === 'left';
  const { dark } = useAppTheme();

  return (
    <OnboardingGate>
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: dark ? "#71C7F2" : "#4A6FE3",
        tabBarInactiveTintColor: dark ? "#ACBACD" : "#64748B",

        tabBarActiveBackgroundColor: isTablet
          ? (dark ? "#203449" : "#E8EEFF")
          : undefined,

        tabBarPosition: position,

        tabBarStyle: themedStyle(isTablet
          ? [styles.tabletTabBar, { paddingTop: Math.max(50, layout.insets.top), paddingBottom: layout.insets.bottom }]
          : [styles.tabBar, bottomTabMetrics(layout.insets.bottom, layout.fontScale)], dark),

        tabBarItemStyle: isTablet
          ? [styles.tabletTabBarItem, { height: sidebarTabItemHeight(layout.fontScale), minHeight: sidebarTabItemHeight(layout.fontScale) }]
          : styles.tabBarItem,

        tabBarLabelStyle:
          styles.tabBarLabel,

        tabBarIconStyle:
          styles.tabBarIcon,

        // iOS display transitions can leave the JS navigator's keyboard "will"
        // visibility stale. Use its default visible navigation; no remounts.
        tabBarHideOnKeyboard: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("Dashboard"),
          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }
              size={size}
              color={typeof color === "number" ? undefined : color ?? undefined}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: t("Activity"),
          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "list"
                  : "list-outline"
              }
              size={size}
              color={typeof color === "number" ? undefined : color ?? undefined}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: t("Reports"),
          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "bar-chart"
                  : "bar-chart-outline"
              }
              size={size}
              color={typeof color === "number" ? undefined : color ?? undefined}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("Settings"),
          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "settings"
                  : "settings-outline"
              }
              size={size}
              color={typeof color === "number" ? undefined : color ?? undefined}
            />
          ),
        }}
      />
    </Tabs>
    </OnboardingGate>
  );
}

const styles = StyleSheet.create({
  tabBar: {
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

  tabletTabBar: {
    width: 250,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderTopWidth: 0,
    elevation: 0,

    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 5,
      height: 0,
    },
  },

  tabBarItem: {
    paddingVertical: 2,
  },

  tabletTabBarItem: {
    width: "100%",
    height: 56,
    minHeight: 56,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 18,
    marginVertical: 5,
    borderRadius: 14,
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
