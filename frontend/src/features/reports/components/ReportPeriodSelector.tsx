import { useLanguage, Translated } from "@/i18n/language";
import { Pressable, ScrollView, Text, View } from "@/theme/components";
import { useRef, useState } from "react";
import { Modal, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@/theme/icons";
import { useIsTablet } from "@/hooks/use-is-tablet";

export type ReportPeriod = "month" | "last-month" | "year" | "last-year" | "custom";
type Props = { selected: ReportPeriod; onSelect: (period: ReportPeriod) => void };
const OPTIONS: { label: string; value: ReportPeriod; detail: string }[] = [
  { label: "This month", value: "month", detail: "Your activity this month so far" },
  { label: "Last month", value: "last-month", detail: "The previous calendar month" },
  { label: "This year", value: "year", detail: "Your activity this year so far" },
  { label: "Last year", value: "last-year", detail: "The previous calendar year" },
  { label: "Custom dates", value: "custom", detail: "Choose a start and end date" },
];

export function ReportPeriodSelector({ selected, onSelect }: Props) {
  useLanguage();
  const [open, setOpen] = useState(false);
  const pending = useRef<ReportPeriod | null>(null);
  const isTablet = useIsTablet();
  const insets = useSafeAreaInsets();
  const current = OPTIONS.find(option => option.value === selected)!;

  function choose(period: ReportPeriod) {
    // Finish dismissing the iOS sheet before opening the custom-date modal.
    if (Platform.OS === "ios") pending.current = period;
    setOpen(false);
    if (Platform.OS !== "ios") onSelect(period);
  }
  function dismiss() {
    pending.current = null;
    setOpen(false);
  }

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`Report period: ${current.label}`}
      accessibilityHint="Choose the dates shown in your report" accessibilityState={{ expanded: open }}
      onPress={() => setOpen(true)} style={({ pressed }) => [s.control, pressed && s.pressed]}>
      <View style={s.calendar}><Ionicons name="calendar-outline" size={22} color="#0072B5" /></View>
      <View style={s.controlCopy}><Text style={s.caption}><Translated text={"Report period"} /></Text><Text style={s.selection}><Translated text={current.label} /></Text></View>
      <Ionicons name="chevron-down" size={18} color="#64748B" />
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={dismiss}
      onDismiss={() => { const next = pending.current; pending.current = null; if (next) onSelect(next); }}>
      <View style={[s.overlay, isTablet && s.overlayTablet]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss period selection" onPress={dismiss} style={StyleSheet.absoluteFill} />
        <View accessibilityViewIsModal style={[s.sheet, isTablet && s.sheetTablet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {!isTablet && <View style={s.handle} />}
          <View style={s.header}><View style={s.headerCopy}><Text accessibilityRole="header" style={s.title}><Translated text={"Report period"} /></Text><Text style={s.subtitle}><Translated text={"Choose the time you want to review."} /></Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close period selection" onPress={dismiss} style={s.close}><Ionicons name="close" size={21} color="#64748B" /></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.options}>
            {OPTIONS.map(option => {
              const active = selected === option.value;
              return <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: active }}
                onPress={() => choose(option.value)} style={({ pressed }) => [s.option, active && s.activeOption, pressed && s.pressed]}>
                <View style={s.optionCopy}><Text style={[s.optionTitle, active && s.activeText]}>{<Translated text={option.label} />}</Text><Text style={s.optionDetail}><Translated text={option.detail} /></Text></View>
                <Ionicons name={active ? "checkmark" : option.value === "custom" ? "chevron-forward" : "ellipse-outline"} size={active ? 22 : 18} color={active ? "#0072B5" : "#A0ACBB"} />
              </Pressable>;
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  control: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 74, padding: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDE5EE", borderRadius: 18, shadowColor: "#273449", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  calendar: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#EAF3FA", alignItems: "center", justifyContent: "center" },
  controlCopy: { flex: 1, gap: 4 }, caption: { fontSize: 12, color: "#64748B", fontWeight: "500" }, selection: { fontSize: 17, color: "#273449", fontWeight: "600" },
  pressed: { opacity: 0.65 }, overlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.3)", justifyContent: "flex-end" }, overlayTablet: { justifyContent: "center", alignItems: "center", padding: 32 },
  sheet: { width: "100%", maxHeight: "85%", backgroundColor: "#FFFFFF", borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 10 }, sheetTablet: { maxWidth: 480, borderRadius: 24, paddingTop: 24 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#D9E0E8", alignSelf: "center", marginBottom: 12 },
  header: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 24, paddingBottom: 20, gap: 12 }, headerCopy: { flex: 1, gap: 7 }, title: { fontSize: 23, fontWeight: "700", color: "#273449", letterSpacing: -0.5 }, subtitle: { fontSize: 14, lineHeight: 21, color: "#64748B" },
  close: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#F3F6F9" }, options: { paddingHorizontal: 16, gap: 6 },
  option: { minHeight: 76, padding: 16, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 16 }, activeOption: { backgroundColor: "#EAF3FA" }, optionCopy: { flex: 1, gap: 5 }, optionTitle: { color: "#273449", fontSize: 16, fontWeight: "600" }, activeText: { color: "#0072B5" }, optionDetail: { fontSize: 13, lineHeight: 19, color: "#64748B" },
});
