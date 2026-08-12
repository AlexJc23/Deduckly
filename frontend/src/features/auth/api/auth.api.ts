import { api } from "@/api/client";
import {
  AuthTokens,
  LoginPayload,
} from "../types/auth.types";
import { RegisterPayload } from "../types/register.types";
import { User } from "../types/user.types";
import { getTemporaryToken } from "../services/twofa-storage.service";

export async function login(
  payload: LoginPayload
): Promise<AuthTokens> {
  const formData = new FormData();

  formData.append("username", payload.email);
  formData.append("password", payload.password);

  const response = await api.post(
    "api/v1/auth/login",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
}
export async function getCurrentUser(): Promise<User> {
  const response = await api.get(
    "api/v1/users/me"
  );
  return response.data;
}

export async function forgotPassword(
  data: { email: string }
) {
  const response = await api.post(
    "/api/v1/auth/forgot-password",
    data
  );

  return response.data;
}


export async function verifyEmail(
  token: string
) {
  const response = await api.post(
    "/api/v1/auth/verify-email",
    {
      token,
    }
  );

  return response.data;
}

export async function resendVerification(
  email: string
) {
  const response = await api.post(
    "/api/v1/auth/resend-verification",
    {
      email,
    }
  );

  return response.data;
}

export async function resetPassword(
  data: {
    token: string;
    new_password: string;
  }
) {
  const response = await api.post(
    "/api/v1/auth/reset-password",
    data
  );

  return response.data;
}

export async function register (
  payload: RegisterPayload
): Promise<AuthTokens> {
  const response = await api.post(
    "api/v1/auth/register",
    payload
  );
  return response.data;
};

export async function refreshToken(
    refreshToken: string
  ): Promise<AuthTokens> {
    const response = await api.post(
      "api/v1/auth/refresh",
      null,
      {
        params: {
          refresh_token: refreshToken,
        },
      }
    );

  return response.data;

};

export async function verify2FA(
  code: string
): Promise<AuthTokens> {
  const tempToken =
    getTemporaryToken();

  const response = await api.post(
    "api/v1/auth/verify-2fa",
    { code },
    {
      headers: {
        Authorization: `Bearer ${tempToken}`,
      }
    }
  );

  return response.data;
}

export async function enable2FA() {
  const response = await api.post(
    "api/v1/auth/enable-2fa"
  );

  return response.data;
}

export async function disable2FA() {
  const response = await api.post(
    "api/v1/auth/disable-2fa"
  );

  return response.data;
}
