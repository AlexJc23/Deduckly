import type { PropsWithChildren, ReactNode } from "react";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView, ScrollView, View } from "@/theme/components";

export function TwoFactorLayout({ children, keyboard = false, footer }: PropsWithChildren<{ keyboard?: boolean; footer?: ReactNode }>) {
  const { height } = useWindowDimensions();
  const compact = height < 540;
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, compact && styles.compact]}
        automaticallyAdjustKeyboardInsets={keyboard && Platform.OS === "ios"}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View style={styles.column}>{children}</View>
      </ScrollView>
      {footer && <View style={[styles.footer, compact && styles.compactFooter]}><View style={styles.column}>{footer}</View></View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F9FC" },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  compact: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  compactFooter: { paddingTop: 0, paddingBottom: 0 },
  column: { width: "100%", maxWidth: 480, alignSelf: "center" },
});
