import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { AuthRequest, ResponseType, CodeChallengeMethod } from "expo-auth-session";
import { api } from "@/api/client";
import { ENV } from "@/config/env";
import { saveTokens } from "@/features/auth/services/auth-service.service";
import { setTemporaryToken } from "@/features/auth/services/twofa-storage.service";

WebBrowser.maybeCompleteAuthSession();
let inFlight = false;

export async function startGoogleLogin(): Promise<boolean | "two-factor"> {
  if (inFlight) return false;
  inFlight = true;
  try {
    if (new URL(ENV.API_URL).protocol !== "https:") throw new Error("HTTPS required");
    const redirectUri = Linking.createURL("oauth/callback", { scheme: "deduckly" });
    // Expo generates the verifier securely. This local request is not sent to Google;
    // the server uses its existing Google client configuration.
    const request = new AuthRequest({ clientId: "deduckly", redirectUri,
      responseType: ResponseType.Code, usePKCE: true, codeChallengeMethod: CodeChallengeMethod.S256 });
    await request.getAuthRequestConfigAsync();
    if (!request.codeChallenge || !request.codeVerifier) throw new Error("PKCE unavailable");
    const { data: transaction } = await api.post("/api/v1/auth/google/start", { code_challenge: request.codeChallenge });
    const authorization = new URL(transaction.authorization_url);
    if (authorization.protocol !== "https:" || authorization.hostname !== "accounts.google.com" || typeof transaction.state !== "string") throw new Error("Invalid authorization response");
    const result = await WebBrowser.openAuthSessionAsync(authorization.toString(), redirectUri);
    if (result.type !== "success" || !result.url) return false;
    const parsed = new URL(result.url), expected = new URL(redirectUri);
    if (parsed.protocol !== expected.protocol || parsed.host !== expected.host || parsed.pathname !== expected.pathname || parsed.hash) return false;
    if (parsed.searchParams.getAll("state").length !== 1 || parsed.searchParams.get("state") !== transaction.state) return false;
    if (parsed.searchParams.has("access_token") || parsed.searchParams.has("refresh_token") || parsed.searchParams.has("error")) return false;
    if (parsed.searchParams.getAll("code").length !== 1) return false;
    const code = parsed.searchParams.get("code");
    if (!code) return false;
    const { data: tokens } = await api.post("/api/v1/auth/google/exchange", {
      state: transaction.state, code, code_verifier: request.codeVerifier,
    });
    if (typeof tokens.access_token !== "string" || !tokens.access_token) return false;
    if (tokens.requires_2fa === true) {
      if (tokens.refresh_token) return false;
      setTemporaryToken(tokens.access_token);
      return "two-factor";
    }
    if (typeof tokens.refresh_token !== "string" || !tokens.refresh_token) return false;
    await saveTokens(tokens.access_token, tokens.refresh_token);
    return true;
  } catch {
    // Axios errors include request bodies; do not expose codes/verifiers in callers' logs.
    throw new Error("Google sign-in could not be completed. Please try again.");
  } finally { inFlight = false; }
}
