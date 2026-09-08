import { useLanguage, Translated } from "@/i18n/language";
import { View, Text, Pressable, AnimatedView } from "@/theme/components";
import { Modal, Animated, Easing, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

type DateFilterModalProps = {
  visible: boolean;
  onClose: () => void;

  startDate: Date | null;
  endDate: Date | null;

  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;

  onClear: () => void;
};

export function DateFilterModal({
  visible,
  onClose,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateFilterModalProps) {
  const { locale } = useLanguage();
  const [isMounted, setIsMounted] = useState(visible);

  const translateY = useRef(
    new Animated.Value(420)
  ).current;

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
        <Pressable
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onPress={onClose}
        />

        <AnimatedView
          style={{
            transform: [{ translateY }],
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            minHeight: 650,
          }}
        >
          

          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            <Translated text={"Start Date"} /></Text>

          <DateTimePicker locale={locale}
            value={startDate ?? new Date()}
            mode="date"
            display="inline"
            onChange={(_, date) => {
              if (date) {
                onStartDateChange(date);
              }
            }}
          />

          <Text
            style={{
              fontWeight: "600",
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            <Translated text={"End Date"} /></Text>

          <DateTimePicker locale={locale}
            value={endDate ?? new Date()}
            mode="date"
            display="inline"
            onChange={(_, date) => {
              if (date) {
                onEndDateChange(date);
              }
            }}
          />

          <Pressable
            onPress={onClear}
            style={{
              marginTop: 20,
              alignItems: "center",
            }}
          >
            <Text><Translated text={"Clear Filters"} /></Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={{
              marginTop: 20,
              alignItems: "center",
            }}
          >
            <Text><Translated text={"Done"} /></Text>
          </Pressable>
        </AnimatedView>
      </View>
    </Modal>
  );
}
