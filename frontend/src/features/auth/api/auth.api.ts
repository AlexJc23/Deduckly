import { api } from "@/api/client";
import {
  AuthTokens,
  LoginPayload,
} from "../types/auth.types";
import { RegisterPayload } from "../types/register.types";
import { User } from "../types/user.types";

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

}
