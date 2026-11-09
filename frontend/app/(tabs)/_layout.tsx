import { useLanguage } from "@/i18n/language";
import { useAppTheme } from "@/theme/theme";
import { Pressable, Text, View, themedStyle } from "@/theme/components";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";
import { Tabs } from "expo-router";
import { BottomTabBar, BottomTabBarHeightCallbackContext, type BottomTabBarProps } from "expo-router/js-tabs";
import { Ionicons } from "@/theme/icons";
import { useContext } from "react";
import { Platform, StyleSheet } from "react-native";
import { useAdaptiveLayout } from '@/hooks/use-adaptive-layout';
import { bottomTabMetrics, sidebarTabItemHeight, tabBarPosition, usesBookSpread } from '@/hooks/adaptive-layout';

function CompactTabs({ bar, metrics, dark, book }: {
  bar: BottomTabBarProps;
  metrics: ReturnType<typeof bottomTabMetrics>;
  dark: boolean;
  book: boolean;
}) {
  const setBarHeight = useContext(BottomTabBarHeightCallbackContext);
  const symmetricInset = Math.max(metrics.style.paddingLeft, metrics.style.paddingRight);
  return (
    <View onLayout={event => setBarHeight?.(event.nativeEvent.layout.height)}
      style={[styles.dock, { paddingBottom: metrics.style.paddingBottom }]}>
      <View accessibilityRole="tablist" style={[styles.compactRow, {
        minHeight: metrics.rowHeight,
        marginLeft: book ? symmetricInset : metrics.style.paddingLeft,
        marginRight: book ? symmetricInset : metrics.style.paddingRight,
      }]}>
        {bar.state.routes.map((route, index) => {
          const { options } = bar.descriptors[route.key];
          const focused = index === bar.state.index;
          const color = focused ? (dark ? '#71C7F2' : '#4A6FE3') : (dark ? '#ACBACD' : '#64748B');
          const label = options.title ?? route.name;
          return (
            <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const event = bar.emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) bar.navigateToTab(route.key);
              }}
              onLongPress={() => bar.emitter.emit({ type: 'tabLongPress', target: route.key })}
              style={[styles.compactTab, focused && styles.selectedTab, book && index === 2 && styles.spineGap]}>
              {options.tabBarIcon?.({ color, focused, size: metrics.iconSize })}
              <Text style={[styles.tabBarLabel, { color, fontSize: metrics.labelSize, flexShrink: 1 }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useLanguage();
  const layout = useAdaptiveLayout();
  const position = tabBarPosition(layout, layout.fontScale);
  const isTablet = position === 'left';
  const bottom = bottomTabMetrics(layout, layout.fontScale);
  const book = usesBookSpread(layout.availableWidth, layout.availableHeight - bottom.style.height, layout.fontScale);
  const { dark } = useAppTheme();

  return (
    <OnboardingGate>
    <Tabs
      tabBar={bar => Platform.OS === 'ios' && !isTablet && bottom.labelPosition === 'beside-icon'
        ? <CompactTabs bar={bar} metrics={bottom} dark={dark} book={book} />
        : <BottomTabBar {...bar} />}
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
          : [styles.tabBar, bottom.style], dark),

        tabBarItemStyle: isTablet
          ? [styles.tabletTabBarItem, { height: sidebarTabItemHeight(layout.fontScale), minHeight: sidebarTabItemHeight(layout.fontScale) }]
          : styles.tabBarItem,

        tabBarLabelPosition: isTablet ? 'beside-icon' : bottom.labelPosition,
        tabBarLabelStyle: [styles.tabBarLabel, !isTablet && { fontSize: bottom.labelSize }],
        tabBarIconStyle: isTablet ? undefined : {
          width: bottom.iconSize,
          height: bottom.iconSize,
          marginBottom: bottom.labelPosition === 'below-icon' ? 2 : 0,
        },

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
              size={isTablet ? size : bottom.iconSize}
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
              size={isTablet ? size : bottom.iconSize}
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
              size={isTablet ? size : bottom.iconSize}
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
              size={isTablet ? size : bottom.iconSize}
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

  dock: { backgroundColor: "#F8FAFC", paddingTop: 3 },
  compactRow: { flexDirection: "row", alignItems: "stretch", gap: 4, paddingHorizontal: 4,
    backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderWidth: 1, borderRadius: 16 },
  selectedTab: { backgroundColor: "#E8EEFF" },
  spineGap: { marginLeft: 32 },
  compactTab: { flex: 1, minWidth: 0, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 4, borderRadius: 12 },

  tabletTabBar: {
    width: 176,
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
    minWidth: 0,
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

  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
