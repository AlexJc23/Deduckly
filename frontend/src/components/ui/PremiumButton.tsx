import { Translated } from "@/i18n/language";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

type PremiumButtonProps = {
  title: string;
  message: string;
  features?: string[];
  onPress?: () => void;
};

export default function PremiumButton({ title, message, onPress }: PremiumButtonProps) {
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${title} ${message} Upgrade to Deduckly Pro.`}
    accessibilityHint="Opens subscription plans and pricing"
    onPress={onPress ?? (() => router.push("/screens/paywall"))}
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    <LinearGradient colors={["#173F5C", "#0D608D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>{<Translated text={title} />}</Text>
      <View style={styles.badge}><Text style={styles.badgeText}><Translated text={"PRO"} /></Text></View>
    </View>
    <Text style={styles.message}>{<Translated text={message} />}</Text>
    <View style={styles.cta}>
      <Text style={styles.ctaText}><Translated text={"Upgrade to Pro"} /></Text>
      <Ionicons name="arrow-forward" size={18} color="#124B70" />
    </View>
    </LinearGradient>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { width: "100%", borderRadius: 18, backgroundColor: "#173F5C" },
  content: { padding: 20, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  pressed: { opacity: 0.88 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  title: { flex: 1, color: "#FFFFFF", fontSize: 20, lineHeight: 26, fontWeight: "700", letterSpacing: -0.4 },
  badge: { backgroundColor: "#ECD8A2", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5, marginTop: 2 },
  badgeText: { fontSize: 9, lineHeight: 13, fontWeight: "700", letterSpacing: 0.6, color: "#493D20" },
  message: { color: "#D7E8F3", fontSize: 13, lineHeight: 21, marginTop: 10 },
  cta: { minHeight: 48, backgroundColor: "#FFFFFF", borderRadius: 11, paddingVertical: 12, paddingHorizontal: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 18 },
  ctaText: { color: "#124B70", fontSize: 15, lineHeight: 21, fontWeight: "600", flexShrink: 1, textAlign: "center" },
});
