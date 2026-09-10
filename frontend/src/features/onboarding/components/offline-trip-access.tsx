import { useState } from "react";
import { ActivityIndicator, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView, ScrollView, View, Text, Pressable } from "@/theme/components";
import { Ionicons } from "@/theme/icons";
import { Translated, useLanguage } from "@/i18n/language";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useTracking } from "@/features/tracking/context/tracking.context";
import { StartTripModal } from "@/features/tracking/components/StartTripModal";

export function OfflineTripAccess({ onRetry, checking }: { onRetry: () => void; checking: boolean }) {
  useLanguage();
  const isTablet = useIsTablet();
  const { width, height } = useWindowDimensions();
  const small = !isTablet && (height <= 931 || width <= 429);
  const { isTracking, isReady, distanceMiles, trackingNotice } = useTracking();
  const [showStart, setShowStart] = useState(false);
  return <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={[styles.scroll, { padding: isTablet ? 40 : small ? 20 : 28 }]}>
      <View style={styles.content}>
        <Text style={styles.brand}>Deduckly</Text>
        <View style={styles.status}>
          <Ionicons name="cloud-offline-outline" size={20} color="#64748B" />
          <Text style={styles.statusText}><Translated text="Offline access" /></Text>
        </View>
        <Text accessibilityRole="header" style={[styles.title, { fontSize: isTablet ? 36 : 28 }]}>
          <Translated text="Your trips can keep going." />
        </Text>
        <Text style={styles.description}>
          <Translated text="We can’t reach Deduckly right now. GPS tracking still works without internet, and your trips save on this device." />
        </Text>
        <View style={styles.card}>
          <Ionicons name="navigate-outline" size={28} color="#0072B5" />
          <Text style={styles.cardTitle}><Translated text={isTracking ? "Trip in Progress" : "Ready for your next trip"} /></Text>
          {isTracking && <Text style={styles.mileage}>{distanceMiles.toFixed(2)} <Translated text="mi" /></Text>}
          <Text style={styles.note}><Translated text="Saved trips will sync when a connection is available." /></Text>
          {trackingNotice && <Text accessibilityRole="alert" style={styles.note}><Translated text={trackingNotice} /></Text>}
          <Pressable accessibilityRole="button" disabled={!isReady} onPress={() => isTracking ? router.push("/tracking/active") : setShowStart(true)}
            style={[styles.primary, !isReady && { opacity: 0.5 }]}>
            {!isReady ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}><Translated text={isTracking ? "Continue trip" : "Start a Trip"} /></Text>}
          </Pressable>
        </View>
        <Text style={styles.note}><Translated text="Reports and account updates need an internet connection." /></Text>
        <Pressable accessibilityRole="button" disabled={checking} onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryText}><Translated text={checking ? "Checking connection…" : "Try reconnecting"} /></Text>
        </Pressable>
      </View>
    </ScrollView>
    <StartTripModal visible={showStart} onClose={() => setShowStart(false)} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { flexGrow: 1, justifyContent: "center" },
  content: { width: "100%", maxWidth: 600, alignSelf: "center", gap: 20 },
  brand: { color: "#273449", fontSize: 24, fontWeight: "800", marginBottom: 8 },
  status: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusText: { fontSize: 14, color: "#64748B", fontWeight: "600" },
  title: { color: "#273449", fontWeight: "700" },
  description: { fontSize: 16, lineHeight: 25, color: "#64748B" },
  card: { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderWidth: 1, borderRadius: 22, padding: 24, gap: 16 },
  cardTitle: { fontSize: 21, fontWeight: "700", color: "#273449" },
  mileage: { fontSize: 32, fontWeight: "700", color: "#0072B5" },
  note: { fontSize: 14, lineHeight: 22, color: "#64748B" },
  primary: { minHeight: 52, borderRadius: 14, backgroundColor: "#0072B5", alignItems: "center", justifyContent: "center", padding: 14 },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", textAlign: "center" },
  retry: { minHeight: 48, alignItems: "center", justifyContent: "center", padding: 12 },
  retryText: { color: "#0072B5", fontWeight: "600", fontSize: 15 },
});
