import { api } from "@/api/client";
import {
  AuthTokens,
  LoginPayload,
} from "../types/auth.types";

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
