import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { View } from "@/theme/components";
import { useAppTheme } from "@/theme/theme";
import { localizedAlert } from "@/i18n/alerts";
import { api } from "@/api/client";
import { useAuth } from "../context/auth.context";
import { saveTokens } from "../services/auth-service.service";
import { setTemporaryToken } from "../services/twofa-storage.service";

export function AppleSignInButton({ disabled = false }: { disabled?: boolean }) {
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const { dark } = useAppTheme();
  const { signIn } = useAuth();
  useEffect(() => {
    let active = true;
    if (Platform.OS === "ios") void AppleAuthentication.isAvailableAsync().then(value => { if (active) setAvailable(value); }).catch(() => {});
    return () => { active = false; };
  }, []);
  async function signInWithApple() {
    if (locked.current || disabled) return;
    locked.current = true;
    setBusy(true);
    try {
      const { data: challenge } = await api.post<{ nonce: string; challenge: string }>("/api/v1/auth/apple/challenge");
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
        nonce: challenge.nonce,
      });
      if (!credential.authorizationCode) throw new Error("Missing Apple authorization code");
      const { data } = await api.post<{ access_token: string; refresh_token?: string }>("/api/v1/auth/apple/login", {
        code: credential.authorizationCode, challenge: challenge.challenge,
        first_name: credential.fullName?.givenName?.slice(0, 50), last_name: credential.fullName?.familyName?.slice(0, 50),
      });
      if (!data.refresh_token) {
        await setTemporaryToken(data.access_token);
        router.push("/(auth)/verify-2fa");
        return;
      }
      await saveTokens(data.access_token, data.refresh_token);
      signIn();
      router.replace("/(tabs)/dashboard");
    } catch (error: any) {
      if (error?.code !== "ERR_REQUEST_CANCELED") {
        localizedAlert("Apple sign-in couldn’t be completed", error?.response?.status === 409
          ? "An account already uses this email. Please use your existing sign-in method."
          : "Please try again. You can also use your existing email or Google sign-in.");
      }
    } finally { locked.current = false; setBusy(false); }
  }
  if (!available) return null;
  return <View style={{ width: "100%", marginBottom: 12, opacity: disabled || busy ? 0.6 : 1 }} pointerEvents={disabled || busy ? "none" : "auto"} accessibilityState={{ busy, disabled: disabled || busy }}>
    <AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={dark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={14} style={{ width: "100%", height: 52 }} onPress={signInWithApple} />
    {busy && <ActivityIndicator style={{ marginTop: 8 }} color="#0072B5" />}
  </View>;
}
