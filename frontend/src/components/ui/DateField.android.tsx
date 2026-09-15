import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";
import NativeDateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Pressable, Text } from "@/theme/components";
import { useLanguage } from "@/i18n/language";

// Android pickers are dialogs, not inline views. Only open on an explicit tap.
export default function DateField({ value, minimumDate, maximumDate, onChange, disabled, locale }: ComponentProps<typeof NativeDateTimePicker> & { locale?: string; disabled?: boolean }) {
  const { t } = useLanguage();
  const opened = useRef(false);
  useEffect(() => () => {
    if (opened.current) void DateTimePickerAndroid.dismiss("date").catch(() => {});
  }, []);
  return <Pressable accessibilityRole="button" accessibilityLabel={`${t("Date")}: ${value.toLocaleDateString(locale)}`}
    disabled={disabled} accessibilityState={{ disabled: !!disabled }}
    style={{ minHeight: 48, paddingHorizontal: 12, paddingVertical: 12, justifyContent: "center", borderRadius: 10, backgroundColor: "#EEF2FF", flexShrink: 1 }}
    onPress={() => {
      if (opened.current) return;
      opened.current = true;
      DateTimePickerAndroid.open({ value, minimumDate, maximumDate, mode: "date", display: "default",
        onChange: (event, selected) => {
          opened.current = false;
          if (event.type === "set" && selected) onChange?.(event, selected);
        },
        onError: () => { opened.current = false; },
      });
    }}>
    <Text style={{ fontSize: 15, color: "#0072B5", fontWeight: "600" }}>{value.toLocaleDateString(locale)}</Text>
  </Pressable>;
}
