import { getAccountGeneration, isAccountChanging } from "@/features/auth/services/account-boundary";
import { trackingOwnerFromToken } from "@/features/tracking/services/tracking-owner";
import {
  getAccessToken,
  getRefreshToken,
  saveRefreshedTokens,
  invalidateSessionForToken,
} from "@/features/auth/services/auth-service.service";
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { ENV } from "@/config/env";
import { refreshAccessToken } from "@/features/auth/services/token.services";
import { AuthTokens } from "@/features/auth/types/auth.types";

declare module "axios" {
  interface AxiosRequestConfig { deducklyOwnerId?: string; deducklyGeneration?: number; }
}

type RetryableRequestConfig =
  InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

export const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
});

let refreshPromise: { generation: number; promise: Promise<AuthTokens> } | null = null;
function assertCurrent(generation: number | undefined) {
  if (isAccountChanging() || (generation !== undefined && generation !== getAccountGeneration())) {
    throw new AxiosError("Account session changed", "ERR_CANCELED");
  }
}

api.interceptors.request.use(async (config) => {
  config.deducklyGeneration ??= getAccountGeneration();
  assertCurrent(config.deducklyGeneration);
  const token = await getAccessToken();
  assertCurrent(config.deducklyGeneration);

  if (config.deducklyOwnerId && trackingOwnerFromToken(token) !== config.deducklyOwnerId) {
    throw new Error("Trip account changed before upload");
  }
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    assertCurrent(response.config.deducklyGeneration);
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    assertCurrent(originalRequest?.deducklyGeneration);
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }
    const authorization = originalRequest.headers.Authorization;
    const requestToken = typeof authorization === "string" && authorization.startsWith("Bearer ")
      ? authorization.slice(7) : null;
    if (originalRequest._retry) {
      await invalidateSessionForToken(requestToken);
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const generation = originalRequest.deducklyGeneration ?? getAccountGeneration();
      if (!refreshPromise || refreshPromise.generation !== generation) {
        const promise = (async () => {
          const storedRefreshToken =
            await getRefreshToken();

          assertCurrent(generation);
          if (!storedRefreshToken) {
            throw new AxiosError("No refresh token", "ERR_SESSION_EXPIRED");
          }

          const tokens =
            await refreshAccessToken(
              storedRefreshToken
            );

          const saved = await saveRefreshedTokens(
            storedRefreshToken,
            tokens.access_token,
            tokens.refresh_token
          );
          if (!saved) throw new AxiosError("Session changed during refresh", "ERR_CANCELED");

          return tokens;
        })().finally(() => {
          if (refreshPromise?.generation === generation) refreshPromise = null;
        });
        refreshPromise = { generation, promise };
      }

      const tokens = await refreshPromise.promise;
      assertCurrent(generation);

      originalRequest.headers.Authorization =
        `Bearer ${tokens.access_token}`;

      return api(originalRequest);
    } catch (refreshError) {
      const failure = refreshError as AxiosError;
      if (failure.code === "ERR_SESSION_EXPIRED" || failure.response?.status === 401 || failure.response?.status === 403) {
        await invalidateSessionForToken(requestToken);
      }
      // A timeout, offline device, or server outage does not invalidate the session.
      return Promise.reject(refreshError);
    }
  }
);