import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { ENV } from "@/config/env";

WebBrowser.maybeCompleteAuthSession();

export async function startGoogleLogin() {
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

  return result;
}