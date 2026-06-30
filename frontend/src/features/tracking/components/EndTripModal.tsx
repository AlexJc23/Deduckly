import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  StyleSheet
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useTracking } from "../context/tracking.context";
import { router } from "expo-router";

type EndTripModalProps = {
    visible: boolean;
    onClose: () => void;
}

export function EndTripModal({
    visible,
    onClose
}: EndTripModalProps) {
    const [isMounted, setIsMounted] = useState(visible);
    const translateY = useRef(new Animated.Value(420)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 420,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIsMounted(false);
      });
    }
  }, [visible, translateY]);

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        {/* Backdrop */}
        <Pressable
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onPress={onClose}
        />

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            transform: [{ translateY }],
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            minHeight: 420,
          }}
        >
          <View>
            <Text>End Trip?</Text>
            <Text>This will stop tracking and save your trip.</Text>
          </View>
          <Pressable onPress={() => {}}>

          </Pressable>
          <Pressable onPress={onClose} style={{ marginTop: 40, backgroundColor: 'green', padding: 20 }}>
            <Text>Resume Trip</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}
