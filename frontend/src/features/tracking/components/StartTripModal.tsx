import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTracking } from "../context/tracking.context";
import { router } from "expo-router";

const categories = [
  { key: "business", label: "Business Trip" },
  { key: "personal", label: "Personal Trip" },
] as const;

const platforms = [
  {
    label: "Uber Eats",
    value: "uber_eats",
  },
  {
    label: "Spark",
    value: "spark",
  },
  {
    label: "DoorDash",
    value: "doordash",
  },
  {
    label: "Lyft",
    value: "lyft",
  },
  {
    label: "Uber",
    value: "uber",
  },
  {
    label: "Grubhub",
    value: "grubhub",
  },
  {
    label: "Instacart",
    value: "instacart",
  },
  {
    label: "Amazon Flex",
    value: "amazon_flex",
  },
  {
    label: "Shipt",
    value: "shipt",
  },
  {
    label: "Other",
    value: "other",
  },
];

type CategoryType =
  (typeof categories)[number]["key"];

type StartTripModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function StartTripModal({
  visible,
  onClose,
}: StartTripModalProps) {
  const [isMounted, setIsMounted] =
    useState(visible);

  const translateY = useRef(
    new Animated.Value(420)
  ).current;

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType | null>(null);

  const [step, setStep] = useState<
    "category" | "platform"
  >("category");

  const [selectedPlatform, setSelectedPlatform] =
    useState<string | null>(null);

  const { startTracking } = useTracking();

  const resetState = () => {
    setSelectedCategory(null);
    setSelectedPlatform(null);
    setStep("category");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCategoryContinue = () => {
    if (!selectedCategory) return;

    if (selectedCategory === "business") {
      setStep("platform");
      return;
    }

    startTracking({
      category: selectedCategory,
      platform: null,
      trackingMethod: "automatic",
    });

    handleClose();
    router.push("/tracking/active");
  };

  const handleStartBusinessTrip = () => {
    if (!selectedPlatform) return;

    startTracking({
      category: "business",
      platform: selectedPlatform,
      trackingMethod: "automatic",
    });

    handleClose();
    router.push("/tracking/active");
  };

  useEffect(() => {
    const animation = Animated.timing(
      translateY,
      {
        toValue: visible ? 0 : 420,
        duration: 320,
        easing: visible
          ? Easing.out(Easing.cubic)
          : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }
    );

    if (visible) {
      setIsMounted(true);
      animation.start();
      return;
    }

    animation.start(() => {
      setIsMounted(false);
    });
  }, [visible, translateY]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />

          {step === "category" ? (
            <>
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <Text style={styles.title}>
                    Start Trip
                  </Text>

                  <Text style={styles.subtitle}>
                    What type of trip are you starting?
                  </Text>
                </View>

                <View style={styles.headerIcon}>
                  <Ionicons
                    name="navigate-outline"
                    size={21}
                    color="#4A6FE3"
                  />
                </View>
              </View>

              <View style={styles.optionsContainer}>
                {categories.map((category) => {
                  const selected =
                    selectedCategory ===
                    category.key;

                  return (
                    <Pressable
                      key={category.key}
                      onPress={() =>
                        setSelectedCategory(
                          category.key
                        )
                      }
                      style={({ pressed }) => [
                        styles.option,
                        selected &&
                          styles.optionSelected,
                        pressed &&
                          styles.optionPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          selected &&
                            styles.optionIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={
                            category.key ===
                            "business"
                              ? "briefcase-outline"
                              : "person-outline"
                          }
                          size={20}
                          color={
                            selected
                              ? "#4A6FE3"
                              : "#64748B"
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.optionTextContainer
                        }
                      >
                        <Text
                          style={[
                            styles.optionTitle,
                            selected &&
                              styles.optionTitleSelected,
                          ]}
                        >
                          {category.label}
                        </Text>

                        <Text
                          style={
                            styles.optionDescription
                          }
                        >
                          {category.key ===
                          "business"
                            ? "Track mileage for work"
                            : "Track a personal drive"}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radio,
                          selected &&
                            styles.radioSelected,
                        ]}
                      >
                        {selected && (
                          <View
                            style={
                              styles.radioInner
                            }
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                disabled={!selectedCategory}
                onPress={handleCategoryContinue}
                style={({ pressed }) => [
                  styles.primaryButton,
                  !selectedCategory &&
                    styles.primaryButtonDisabled,
                  pressed &&
                    selectedCategory &&
                    styles.primaryButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.primaryText,
                    !selectedCategory &&
                      styles.primaryTextDisabled,
                  ]}
                >
                  Continue
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={
                    selectedCategory
                      ? "#FFFFFF"
                      : "#94A3B8"
                  }
                />
              </Pressable>

              <Pressable
                onPress={handleClose}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <Text style={styles.title}>
                    Select Platform
                  </Text>

                  <Text style={styles.subtitle}>
                    Which platform are you driving for?
                  </Text>
                </View>

                <View style={styles.headerIcon}>
                  <Ionicons
                    name="car-outline"
                    size={21}
                    color="#4A6FE3"
                  />
                </View>
              </View>

              <ScrollView
                style={styles.platformList}
                contentContainerStyle={
                  styles.platformListContent
                }
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {platforms.map((platform) => {
                  const selected =
                    selectedPlatform ===
                    platform.value;

                  return (
                    <Pressable
                      key={platform.label}
                      onPress={() =>
                        setSelectedPlatform(
                          platform.value
                        )
                      }
                      style={({ pressed }) => [
                        styles.platformOption,
                        selected &&
                          styles.optionSelected,
                        pressed &&
                          styles.optionPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.platformText,
                          selected &&
                            styles.optionTitleSelected,
                        ]}
                      >
                        {platform.label}
                      </Text>

                      <View
                        style={[
                          styles.radio,
                          selected &&
                            styles.radioSelected,
                        ]}
                      >
                        {selected && (
                          <View
                            style={
                              styles.radioInner
                            }
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable
                disabled={!selectedPlatform}
                onPress={
                  handleStartBusinessTrip
                }
                style={({ pressed }) => [
                  styles.primaryButton,
                  !selectedPlatform &&
                    styles.primaryButtonDisabled,
                  pressed &&
                    selectedPlatform &&
                    styles.primaryButtonPressed,
                ]}
              >
                <Ionicons
                  name="play"
                  size={17}
                  color={
                    selectedPlatform
                      ? "#FFFFFF"
                      : "#94A3B8"
                  }
                />

                <Text
                  style={[
                    styles.primaryText,
                    !selectedPlatform &&
                      styles.primaryTextDisabled,
                  ]}
                >
                  Start Trip
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setSelectedPlatform(null);
                  setStep("category");
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>
                  Back
                </Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    minHeight: 420,

    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: -8,
    },

    elevation: 12,
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginBottom: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  optionsContainer: {
    gap: 10,
  },

  option: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  platformList: {
    maxHeight: 230,
  },

  platformListContent: {
    gap: 10,
    paddingBottom: 2,
  },

  platformOption: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  optionSelected: {
    borderColor: "#4A6FE3",
    backgroundColor: "#F4F7FF",
  },

  optionPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.985 }],
  },

  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  optionIconSelected: {
    backgroundColor: "#DCE6FF",
  },

  optionTextContainer: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  optionTitleSelected: {
    color: "#3559C7",
  },

  optionDescription: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  platformText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: "#4A6FE3",
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#4A6FE3",
  },

  primaryButton: {
    height: 52,
    marginTop: 22,
    borderRadius: 14,
    backgroundColor: "#4A6FE3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    shadowColor: "#4A6FE3",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  primaryButtonPressed: {
    backgroundColor: "#3559C7",
    transform: [{ scale: 0.985 }],
  },

  primaryButtonDisabled: {
    backgroundColor: "#E2E8F0",
    shadowOpacity: 0,
    elevation: 0,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  primaryTextDisabled: {
    color: "#94A3B8",
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginTop: 6,
  },

  cancelText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});