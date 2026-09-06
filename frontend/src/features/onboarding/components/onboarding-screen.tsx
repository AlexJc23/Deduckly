import { ComponentProps } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import Logo from "../../../../assets/images/logo.svg";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useOnboarding } from "../hooks/use-onboarding";

type IconName = ComponentProps<typeof Ionicons>["name"];
type SymbolName = ComponentProps<typeof SymbolView>["name"];
export interface OnboardingContent {
  label: string;
  title: string;
  description: string;
  icon: IconName;
  symbol: SymbolName;
  action: string;
  note: string;
  features: readonly { title: string; description: string; icon: IconName; symbol: SymbolName }[];
}

type Props = {
  screen: OnboardingContent;
  onboarding: ReturnType<typeof useOnboarding>;
  onContinue: () => void;
  onSkip?: () => void;
};

function OnboardingIcon({ symbol, icon, size }: { symbol: SymbolName; icon: IconName; size: number }) {
  return <SymbolView name={symbol} size={size} weight="regular" tintColor="#0072B5"
    style={{ width: size, height: size }}
    fallback={<Ionicons name={icon} size={size} color="#0072B5" />} />;
}

export function OnboardingScreen({ screen, onboarding, onContinue, onSkip }: Props) {
  const { loading, isLoading, userId, step, error, busy, settings, setError, retry, signOut } = onboarding;
  const isTablet = useIsTablet();
  const { height, width } = useWindowDimensions();
  const isSmallPhone = !isTablet && (height <= 931 || width <= 429);
  const isWelcome = step === 2;
  const ready = !loading && !isLoading && userId !== undefined;

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[
      styles.scroll, isSmallPhone && styles.scrollCompact, isTablet && styles.scrollTablet,
    ]}>
      <View style={[styles.container, isTablet && styles.containerTablet]}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>Deduckly</Text>
          {ready && <Text style={styles.step} accessibilityLabel={`Step ${step + 1} of 3`}>{step + 1} of 3</Text>}
        </View>
        {loading || isLoading ? <ActivityIndicator color="#0072B5" style={styles.loader} accessibilityLabel="Loading your account" />
          : !ready ? <View style={styles.recovery}>
            <Text accessibilityRole="alert" style={styles.description}>{error}</Text>
            <Pressable accessibilityRole="button" style={styles.button} onPress={retry}><Text style={styles.buttonText}>Try again</Text></Pressable>
            <Pressable accessibilityRole="button" style={styles.skip} onPress={signOut}><Text style={styles.skipText}>Sign out</Text></Pressable>
          </View> : <>
            <View style={[styles.main, isSmallPhone && styles.mainCompact, isTablet && styles.mainTablet]}>
              <View style={[styles.intro, isTablet && styles.introTablet]}>
                <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
                  style={[styles.hero, isSmallPhone && styles.heroCompact]}>
                  {isWelcome
                    ? <Logo width={isTablet ? 120 : isSmallPhone ? 80 : 100} height={isTablet ? 120 : isSmallPhone ? 80 : 100} color="#0072B5" />
                    : <OnboardingIcon symbol={screen.symbol} icon={screen.icon} size={isTablet ? 76 : isSmallPhone ? 52 : 64} />}
                </View>
                <Text style={styles.label}>{screen.label}</Text>
                <Text accessibilityRole="header" style={[styles.title, isSmallPhone && styles.titleCompact, isTablet && styles.titleTablet]}>{screen.title}</Text>
                <Text style={[styles.description, isTablet && styles.descriptionTablet]}>{screen.description}</Text>
              </View>
              <View style={[styles.features, isSmallPhone && styles.featuresCompact, isTablet && styles.featuresTablet]}>
                {screen.features.map((feature, index) => <View key={feature.title} style={[
                  styles.feature, isSmallPhone && styles.featureCompact, index > 0 && styles.featureBorder,
                ]}>
                  <View style={styles.featureIcon} accessible={false} accessibilityElementsHidden>
                    <OnboardingIcon symbol={feature.symbol} icon={feature.icon} size={25} />
                  </View>
                  <View style={styles.featureCopy}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>)}
              </View>
            </View>
            <View style={[styles.footer, isTablet && styles.footerTablet]}>
              {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
              {settings && <Pressable accessibilityRole="button" style={styles.skip} disabled={busy}
                onPress={() => Linking.openSettings().catch(() => setError("Please open your device settings to change permissions."))}>
                <Text style={styles.settingsText}>Open device settings</Text>
              </Pressable>}
              <Text style={styles.note}>{screen.note}</Text>
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy}
                onPress={onContinue} style={({ pressed }) => [styles.button, (pressed || busy) && styles.pressed]}>
                {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{screen.action}</Text>}
              </Pressable>
              {onSkip && <Pressable accessibilityRole="button" disabled={busy} onPress={onSkip} style={styles.skip}>
                <Text style={[styles.skipText, busy && styles.pressed]}>Not now</Text>
              </Pressable>}
            </View>
          </>}
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 16 },
  scrollCompact: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  scrollTablet: { paddingHorizontal: 56, paddingVertical: 36 },
  container: { flex: 1, width: "100%", maxWidth: 520, alignSelf: "center" },
  containerTablet: { maxWidth: 1000 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 32 },
  wordmark: { fontSize: 20, fontWeight: "700", letterSpacing: -0.6, color: "#273449" },
  step: { fontSize: 13, fontWeight: "500", color: "#697586", fontVariant: ["tabular-nums"] },
  loader: { marginTop: 80 },
  recovery: { flex: 1, justifyContent: "center", gap: 20 },
  main: { flex: 1, justifyContent: "center", paddingVertical: 40 },
  mainCompact: { paddingVertical: 24 },
  mainTablet: { flexDirection: "row", alignItems: "center", gap: 48, paddingVertical: 56 },
  intro: { width: "100%" },
  introTablet: { flex: 1, width: undefined },
  hero: { minHeight: 100, justifyContent: "center", alignItems: "flex-start", marginBottom: 26 },
  heroCompact: { minHeight: 80, marginBottom: 18 },
  label: { color: "#0072B5", fontSize: 13, fontWeight: "600", marginBottom: 10 },
  title: { color: "#1C2738", fontSize: 38, lineHeight: 43, fontWeight: "700", letterSpacing: -1.2 },
  titleCompact: { fontSize: 32, lineHeight: 37, letterSpacing: -0.9 },
  titleTablet: { fontSize: 44, lineHeight: 50, letterSpacing: -1.5 },
  description: { color: "#647184", fontSize: 16, lineHeight: 24, marginTop: 16 },
  descriptionTablet: { fontSize: 18, lineHeight: 28, marginTop: 20 },
  features: { marginTop: 32 },
  featuresCompact: { marginTop: 22 },
  featuresTablet: { flex: 1, marginTop: 0, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, backgroundColor: "#FFFFFF" },
  feature: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 18, gap: 16 },
  featureCompact: { paddingVertical: 14 },
  featureBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#DDE3EA" },
  featureIcon: { width: 28, alignItems: "center", paddingTop: 2 },
  featureCopy: { flex: 1, gap: 5 },
  featureTitle: { color: "#273449", fontSize: 16, fontWeight: "600", lineHeight: 21 },
  featureDescription: { color: "#647184", fontSize: 14, lineHeight: 20 },
  footer: { width: "100%", paddingTop: 8 },
  footerTablet: { maxWidth: 440, alignSelf: "center" },
  note: { color: "#697586", fontSize: 12, lineHeight: 18, textAlign: "center", marginBottom: 18 },
  button: { minHeight: 54, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, backgroundColor: "#0072B5", alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 17, lineHeight: 22, fontWeight: "600", textAlign: "center" },
  pressed: { opacity: 0.6 },
  skip: { minHeight: 48, padding: 14, alignItems: "center", justifyContent: "center" },
  skipText: { fontSize: 15, color: "#647184", fontWeight: "500" },
  settingsText: { fontSize: 15, color: "#0072B5", fontWeight: "600" },
  error: { color: "#B91C1C", backgroundColor: "#FEF2F2", padding: 14, borderRadius: 12, fontSize: 13, lineHeight: 19, marginBottom: 14 },
});
