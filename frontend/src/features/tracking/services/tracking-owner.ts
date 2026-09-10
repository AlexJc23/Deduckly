import { toByteArray } from "base64-js";

// This identifies local records only. The API still authenticates and authorizes all requests.
export function trackingOwnerFromToken(token: string | null): string | null {
  try {
    if (!token) return null;
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = toByteArray(part.padEnd(Math.ceil(part.length / 4) * 4, "="));
    const claims = JSON.parse(decodeURIComponent(Array.from(bytes, byte =>
      `%${byte.toString(16).padStart(2, "0")}`).join("")));
    if (claims.type && claims.type !== "access") return null;
    return typeof claims.sub === "string" && claims.sub.length > 0 ? claims.sub : null;
  } catch { return null; }
}
