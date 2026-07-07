import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useTracking } from "../context/tracking.context";
import { router } from "expo-router";

const categories = [
  { key: "business", label: "Business Trip" },
  { key: "personal", label: "Personal Trip" },
] as const;

const platforms = [
  {
    label: "Lyft",
    value: "lyft",
  },
  {
    label: "Uber Eats",
    value: "uber_eats",
  },
  {
    label: "DoorDash",
    value: "doordash",
  },
  {
    label: "Instacart",
    value: "instacart",
  },
];

type CategoryType = (typeof categories)[number]["key"];

type StartTripModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function StartTripModal({
  visible,
  onClose,
}: StartTripModalProps) {
  const [isMounted, setIsMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(420)).current;
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [step, setStep] = useState<"category" | "platform">("category");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
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
    const animation = Animated.timing(translateY, {
      toValue: visible ? 0 : 420,
      duration: 300,
      easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    });

    if (visible) {
      setIsMounted(true);
      animation.start();
      return;
    }

    animation.start(() => {
      setIsMounted(false);
    });
  }, [visible, translateY]);

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {step === "category" ? (
            <>
              <Text style={styles.title}>Start Trip</Text>

              {categories.map((category) => (
                <Pressable
                  key={category.key}
                  onPress={() => setSelectedCategory(category.key)}
                  style={[
                    styles.option,
                    {
                      borderColor:
                        selectedCategory === category.key ? "#007AFF" : "#DDD",
                    },
                  ]}
                >
                  <Text>{category.label}</Text>
                </Pressable>
              ))}

              <Pressable
                disabled={!selectedCategory}
                onPress={handleCategoryContinue}
                style={styles.primaryButton}
              >
                <Text>Continue</Text>
              </Pressable>

              <Pressable onPress={handleClose} style={styles.secondaryButton}>
                <Text>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => {
                  setSelectedPlatform(null);
                  setStep("category");
                }}
                style={styles.secondaryButton}
              >
                <Text>Back</Text>
              </Pressable>

              {platforms.map((platform) => (
                <Pressable
                  key={platform.label}
                  onPress={() => setSelectedPlatform(platform.value)}
                  style={[
                    styles.option,
                    {
                      borderColor:
                        selectedPlatform === platform.value ? "#007AFF" : "#DDD",
                    },
                  ]}
                >
                  <Text>{platform.label}</Text>
                </Pressable>
              ))}

              <Pressable
                disabled={!selectedPlatform}
                onPress={handleStartBusinessTrip}
                style={styles.primaryButton}
              >
                <Text>Start Trip</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 420,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  primaryButton: {
    marginTop: 40,
  },
  secondaryButton: {
    marginTop: 24,
  },
});
