import { Pressable, ScrollView, Text, TextInput, View, SafeAreaView } from "@/theme/components";
import { useRef, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@/theme/icons";
import Logo from "../../assets/images/logo.svg";
import { forgotPassword } from "@/features/auth/api/auth.api";
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function ForgotPassword() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
  const [sentTo, setSentTo] = useState("");
  const locked = useRef(false);
  const isTablet = useIsTablet();
  const request = useMutation({ mutationFn: forgotPassword, retry: false });
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function sendReset() {
    if (!validEmail || locked.current) return;
    Keyboard.dismiss();
    locked.current = true;
    const address = email.trim();
    try {
      await request.mutateAsync({ email: address });
      setSentTo(address);
    } catch {
      // The mutation's error state is displayed below, without exposing account existence.
    } finally {
      locked.current = false;
    }
  }

  return <SafeAreaView style={s.screen}>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={[s.scroll, isTablet && s.tablet]} keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/(auth)/login")} style={s.back}>
            <Ionicons name="arrow-back" size={20} color="#273449" /><Text style={s.backText}>Back to sign in</Text>
          </Pressable>
          <View style={s.main}>
            <Logo width={72} height={72} color="#0072B5" />
            <Text accessibilityRole="header" style={s.title}>{sentTo ? "Check your inbox" : "Forgot your password?"}</Text>
            <Text style={s.description}>{sentTo
              ? `If an account exists for ${sentTo}, you’ll receive a link to reset your password. Check your spam folder too.`
              : "Enter the email address on your Deduckly account and we’ll help you reset your password."}</Text>
            {sentTo ? <Text style={s.note}>The reset link expires in 30 minutes. If you request another, use the most recent email.</Text> : <View style={s.field}>
              <Text style={s.label}>Email address</Text>
              <TextInput accessibilityLabel="Email address" value={email} onChangeText={value => { setEmail(value); if (request.isError) request.reset(); }}
                editable={!request.isPending} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                textContentType="emailAddress" placeholder="you@example.com" placeholderTextColor="#94A3B8"
                returnKeyType="send" onSubmitEditing={sendReset} style={s.input} />
            </View>}
            {request.isError && <Text accessibilityRole="alert" style={s.error}>We couldn’t request the reset email. Check your connection and try again.</Text>}
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !validEmail || request.isPending, busy: request.isPending }}
              disabled={!validEmail || request.isPending} onPress={sendReset}
              style={({ pressed }) => [s.button, (!validEmail || request.isPending || pressed) && s.dimmed]}>
              {request.isPending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.buttonText}>{sentTo ? "Resend reset email" : "Send reset link"}</Text>}
            </Pressable>
            {!!sentTo && <Pressable accessibilityRole="button" disabled={request.isPending}
              onPress={() => { setSentTo(""); request.reset(); }} style={s.secondary}><Text style={s.secondaryText}>Use a different email</Text></Pressable>}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F9FC" }, flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 }, tablet: { padding: 40 }, content: { flex: 1, width: "100%", maxWidth: 520, alignSelf: "center" },
  back: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8 }, backText: { color: "#273449", fontWeight: "600", fontSize: 14 },
  main: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 32 },
  title: { marginTop: 26, fontSize: 30, lineHeight: 36, fontWeight: "700", color: "#273449", textAlign: "center", letterSpacing: -0.6 },
  description: { marginTop: 14, fontSize: 15, lineHeight: 23, color: "#64748B", textAlign: "center" }, note: { marginTop: 16, color: "#64748B", fontSize: 13, lineHeight: 20, textAlign: "center" },
  field: { width: "100%", marginTop: 28 }, label: { fontSize: 13, color: "#475569", fontWeight: "600", marginBottom: 8 }, input: { minHeight: 54, padding: 15, borderWidth: 1, borderColor: "#DDE4ED", borderRadius: 14, backgroundColor: "#FFFFFF", color: "#273449", fontSize: 16 },
  button: { width: "100%", minHeight: 54, padding: 16, marginTop: 24, backgroundColor: "#0072B5", borderRadius: 14, alignItems: "center", justifyContent: "center" }, buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" }, dimmed: { opacity: 0.5 },
  secondary: { minHeight: 48, padding: 14, justifyContent: "center" }, secondaryText: { color: "#0072B5", fontSize: 14, fontWeight: "600" },
  error: { width: "100%", padding: 14, borderRadius: 12, backgroundColor: "#FEF2F2", color: "#B91C1C", fontSize: 13, lineHeight: 20, marginTop: 18 },
});
