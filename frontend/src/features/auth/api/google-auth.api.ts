import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { ENV } from "@/config/env";
import { saveTokens } from "@/features/auth/services/auth-service.service";

WebBrowser.maybeCompleteAuthSession();

export async function startGoogleLogin(): Promise<boolean> {
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

  if (!accessToken || !refreshToken) {
    return false;
  }

  await saveTokens(
    accessToken,
    refreshToken
  );

  return true;
}