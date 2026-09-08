import { useLanguage, Translated } from "@/i18n/language";
import { View, Text, Pressable, ScrollView } from "@/theme/components";
import React, { useEffect } from "react";
import { StyleSheet, Image } from "react-native";

import { NativeModules } from "react-native";
import { router } from "expo-router";
import { BackHeader } from "@/components/ui/BackButton";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { Ionicons } from "@/theme/icons";


const APP_ICONS = [
  {
    id: "default",
    name: "Classic",
    premium: false,
    image: require("../../assets/images/logo.png"),
  },
  {
    id: "blackWhite",
    name: "Black & White",
    premium: false,
    image: require("../../assets/images/app-icons/black_white.png"),
  },
  {
    id: "apple",
    name: "Apple",
    premium: false,
    image: require("../../assets/images/app-icons/apple.png"),
  },
  {
    id: "blackRedChrome",
    name: "Black Red Chrome",
    premium: true,
    image: require("../../assets/images/app-icons/black_red_chrome.png"),
  },
  {
    id: "chrome",
    name: "Chrome",
    premium: true,
    image: require("../../assets/images/app-icons/chrome.png"),
  },
  {
    id: "deducklyHorizon",
    name: "Deduckly Horizon",
    premium: true,
    image: require("../../assets/images/app-icons/Deduckly_Horizon.png"),
  },
  {
    id: "roseGold",
    name: "Rose Gold",
    premium: true,
    image: require("../../assets/images/app-icons/rose_gold.png"),
  },
  {
    id: "fall",
    name: "Fall",
    premium: true,
    image: require("../../assets/images/app-icons/fall.png"),
  },
  {
    id: "halloween1",
    name: "Halloween",
    premium: true,
    image: require("../../assets/images/app-icons/halloween1.png"),
  },
  {
    id: "halloween2",
    name: "Halloween 2",
    premium: true,
    image: require("../../assets/images/app-icons/halloween2.png"),
  },
  {
    id: "spring",
    name: "Spring",
    premium: true,
    image: require("../../assets/images/app-icons/spring.png"),
  },
  {
    id: "winter",
    name: "Winter",
    premium: true,
    image: require("../../assets/images/app-icons/winter.png"),
  },
];

const PREMIUM_ICONS = [
  "BlackRedChromeIcon",
  "ChromeIcon",
  "DeducklyHorizonIcon",
  "RoseGoldIcon",
  "FallIcon",
  "Halloween1Icon",
  "Halloween2Icon",
  "SpringIcon",
  "WinterIcon",
];

const { AppIconManager } = NativeModules;

export default function AppIconScreen() {
  useLanguage();
  const { data: user } = useCurrentUser();
  const isTablet = useIsTablet();

  const isPremium = user?.is_premium ?? false;

  /**
   * If the user's premium entitlement disappears,
   * only reset the icon if they were actually using
   * a premium icon.
   *
   * Free icons remain selected.
   */
  useEffect(() => {
    if (isPremium) {
      return;
    }

    const resetPremiumIconIfNeeded = async () => {
      try {
        const currentIcon =
          await AppIconManager?.getCurrentIcon();

        console.log("Current app icon:", currentIcon);

        if (PREMIUM_ICONS.includes(currentIcon)) {
          console.log(
            "Premium entitlement lost. Resetting app icon to Classic."
          );

          await AppIconManager.setIcon(null);
        }
      } catch (error) {
        console.error(
          "Failed to check current app icon:",
          error
        );
      }
    };

    resetPremiumIconIfNeeded();
  }, [isPremium]);

  console.log("AppIconManager:", AppIconManager);

  return (
    <View style={styles.container}>
      <BackHeader />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isTablet && styles.contentTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.contentInner,
            isTablet && styles.contentInnerTablet,
          ]}
        >
          <Text
            style={[
              styles.title,
              isTablet && styles.titleTablet,
            ]}
          >
            <Translated text={"App Icon"} /></Text>

          <Text
            style={[
              styles.subtitle,
              isTablet && styles.subtitleTablet,
            ]}
          >
            <Translated text={"Choose the icon Deduckly uses on your Home Screen."} /></Text>

          <View
            style={[
              styles.grid,
              isTablet && styles.gridTablet,
            ]}
          >
            {APP_ICONS.map((icon) => {
              const locked = icon.premium && !isPremium;

              return (
                <Pressable
                  key={icon.id}
                  style={[
                    styles.iconCard,
                    isTablet && styles.iconCardTablet,
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
                          : `${icon.id.charAt(0).toUpperCase()}${icon.id.slice(
                              1
                            )}Icon`;

                      console.log(
                        "Changing app icon to:",
                        iconName
                      );

                      await AppIconManager.setIcon(iconName);

                      console.log(
                        "Changed app icon to:",
                        iconName
                      );
                    } catch (error) {
                      console.error(
                        "Failed to change app icon:",
                        error
                      );
                    }
                  }}
                >
                  <View
                    style={[
                      styles.iconPreview,
                      isTablet &&
                        styles.iconPreviewTablet,
                    ]}
                  >
                    <Image
                      source={icon.image}
                      style={styles.iconImage}
                      resizeMode="cover"
                    />

                    {locked && (
                      <View
                        style={[
                          styles.lockBadge,
                          isTablet &&
                            styles.lockBadgeTablet,
                        ]}
                      >
                        <Text
                          style={[
                            styles.lockText,
                            isTablet &&
                              styles.lockTextTablet,
                          ]}
                        >

                          <Ionicons name="lock-closed-outline" size={16} color="#121111" />
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.iconName,
                      isTablet &&
                        styles.iconNameTablet,
                    ]}
                  >
                    {icon.name}
                  </Text>

                  {locked && (
                    <Text
                      style={[
                        styles.premiumText,
                        isTablet &&
                          styles.premiumTextTablet,
                      ]}
                    >
                      <Translated text={"Premium"} /></Text>
                  )}
                </Pressable>
              );
            })}
          </View>
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

  contentTablet: {
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 56,
  },

  contentInner: {
    width: "100%",
  },

  contentInnerTablet: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },

  titleTablet: {
    fontSize: 34,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },

  subtitleTablet: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 30,
    maxWidth: 650,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },

  gridTablet: {
    gap: 20,
    justifyContent: "flex-start",
  },

  iconCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,

    elevation: 2,
  },

  iconCardTablet: {
    width: "31.5%",
    minHeight: 230,
    borderRadius: 20,
    padding: 22,
  },

  iconCardLocked: {
    opacity: 0.7,
  },

  iconPreview: {
    width: 110,
    height: 110,
    borderRadius: 24,
    position: "relative",
    overflow: "visible",
  },

  iconPreviewTablet: {
    width: 135,
    height: 135,
    borderRadius: 28,
  },

  iconImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },

  lockBadge: {
    position: "absolute",
    right: -6,
    top: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,

    elevation: 3,
  },

  lockBadgeTablet: {
    width: 34,
    height: 34,
    borderRadius: 17,
    right: -7,
    top: -7,
  },

  lockText: {
    fontSize: 14,
  },

  lockTextTablet: {
    fontSize: 16,
  },

  iconName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },

  iconNameTablet: {
    marginTop: 16,
    fontSize: 17,
  },

  premiumText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  premiumTextTablet: {
    marginTop: 6,
    fontSize: 13,
  },
});