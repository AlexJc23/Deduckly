import axios from "axios";
import { ENV } from "@/config/env";
import { AuthTokens } from "../types/auth.types";

export async function refreshAccessToken(
  refreshToken: string
): Promise<AuthTokens> {
  const response = await axios.post(
    `${ENV.API_URL}/api/v1/auth/refresh`,
    null,
    {
      params: {
        refresh_token: refreshToken,
      },
    }
  );

  return response.data;
}
