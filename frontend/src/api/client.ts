import {
    getAccessToken,
    getRefreshToken,
    saveTokens,
    clearTokens,
 } from "@/features/auth/services/auth-service.service";
import axios from "axios";
import { ENV } from "@/config/env";
import { refreshAccessToken } from "@/features/auth/services/token.services";


export const api = axios.create({
    baseURL: ENV.API_URL,
    timeout: 10000,
});

api.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken =
          await getRefreshToken();

        if (!storedRefreshToken) {
          throw new Error(
            "No refresh token"
          );
        }

        const tokens =
          await refreshAccessToken(
            storedRefreshToken
          );

        await saveTokens(
          tokens.access_token,
          tokens.refresh_token
        );

        originalRequest.headers.Authorization =
          `Bearer ${tokens.access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        await clearTokens();

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);
