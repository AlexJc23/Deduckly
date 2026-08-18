import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "@/features/auth/services/auth-service.service";
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { ENV } from "@/config/env";
import { refreshAccessToken } from "@/features/auth/services/token.services";
import { AuthTokens } from "@/features/auth/types/auth.types";

type RetryableRequestConfig =
  InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

export const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
});

let refreshPromise: Promise<AuthTokens> | null = null;

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const storedRefreshToken =
            await getRefreshToken();

          if (!storedRefreshToken) {
            throw new Error("No refresh token");
          }

          const tokens =
            await refreshAccessToken(
              storedRefreshToken
            );

          await saveTokens(
            tokens.access_token,
            tokens.refresh_token
          );

          return tokens;
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const tokens = await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${tokens.access_token}`;

      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;

      await clearTokens();

      return Promise.reject(refreshError);
    }
  }
);