import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { ENV } from "@/config/env";
import { saveTokens } from "@/features/auth/services/auth-service.service";

import { setTemporaryToken } from "@/features/auth/services/twofa-storage.service";

WebBrowser.maybeCompleteAuthSession();

export async function startGoogleLogin(): Promise<boolean | "two-factor"> {
  const redirectUri = Linking.createURL(
    "oauth/callback",
    {
      scheme: "deduckly",
    }
  );

  const googleLoginUrl =
    `${ENV.API_URL}/api/v1/auth/google/login`;

  const result =
    await WebBrowser.openAuthSessionAsync(
      googleLoginUrl,
      redirectUri
    );

  if (
    result.type !== "success" ||
    !result.url
  ) {
    return false;
  }

  const parsed = new URL(result.url);

  const accessToken =
    parsed.searchParams.get("access_token");

  const refreshToken =
    parsed.searchParams.get("refresh_token");

  if (parsed.searchParams.get("requires_2fa") === "true") {
    if (!accessToken || refreshToken) return false;
    setTemporaryToken(accessToken);
    return "two-factor";
  }

  if (!accessToken || !refreshToken) {
    return false;
  }

  await saveTokens(
    accessToken,
    refreshToken
  );

  return true;
}