import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";

import { NativeModules } from "react-native";
import { router } from "expo-router";
import { BackHeader } from "@/components/ui/BackButton";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";


const APP_ICONS = [
  {
    id: "default",
    name: "Classic",
    premium: false,
  },
  {
    id: "blackWhite",
    name: "Black & White",
    premium: true,
  },
  {
    id: "fall",
    name: "Fall",
    premium: true,
  },
  {
    id: "halloween1",
    name: "Halloween",
    premium: true,
  },
  {
    id: "halloween2",
    name: "Halloween 2",
    premium: true,
  },
  {
    id: "spring",
    name: "Spring",
    premium: true,
  },
  {
    id: "winter",
    name: "Winter",
    premium: true,
  },
];

const { AppIconManager } = NativeModules;

export default function AppIconScreen() {
  const { data: user } = useCurrentUser();

  const isPremium = true;
  console.log("AppIconManager:", AppIconManager);

  return (
    <View style={styles.container}>
      <BackHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>App Icon</Text>

        <Text style={styles.subtitle}>
          Choose the icon Deduckly uses on your Home Screen.
        </Text>

        <View style={styles.grid}>
          {APP_ICONS.map((icon) => {
            const locked =
              icon.premium && !isPremium;

            return (
              <Pressable
                key={icon.id}
                style={[
                  styles.iconCard,
                  locked && styles.iconCardLocked,
                ]}
                onPress={async () => {
                    if (locked) {
                        router.push("/screens/paywall");
                        return;
                    }

                    try {
                        const iconName =
                        icon.id === "default"
                            ? null
                            : `${icon.id.charAt(0).toUpperCase()}${icon.id.slice(1)}Icon`;

                        console.log("Changing app icon to:", iconName);

                        await AppIconManager.setIcon(iconName);

                        console.log("Changed app icon to:", iconName);
                    } catch (error) {
                        console.error("Failed to change app icon:", error);
                    }
                    }}
              >
                <View style={styles.iconPlaceholder}>
                  <Text style={styles.iconEmoji}>
                    🦆
                  </Text>

                  {locked && (
                    <View style={styles.lockBadge}>
                      <Text style={styles.lockText}>
                        🔒
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.iconName}>
                  {icon.name}
                </Text>

                {locked && (
                  <Text style={styles.premiumText}>
                    Premium
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },

  iconCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },

  iconCardLocked: {
    opacity: 0.7,
  },

  iconPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  iconEmoji: {
    fontSize: 52,
  },

  lockBadge: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  lockText: {
    fontSize: 14,
  },

  iconName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  premiumText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
});