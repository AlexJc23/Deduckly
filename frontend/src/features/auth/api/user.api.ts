import { api } from "@/api/client";
import { UserUpdate, UpdatePasswordRequest } from "../types/user.types";

export async function updateCurrentUser(
  user: UserUpdate
) {
  const response = await api.put(
    "/api/v1/users/me",
    user
  );

  return response.data;
}

export async function deleteCurrentUser() {
  const response = await api.delete(
    "/api/v1/users/me"
  );

  return response.data;
}
export async function updatePassword(
  data: UpdatePasswordRequest
) {
  const response = await api.post(
    "/api/v1/auth/update-password",
    data
  );
  return response.data;
}