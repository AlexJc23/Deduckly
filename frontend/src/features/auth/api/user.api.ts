import { api } from "@/api/client";
import { UserUpdate } from "../types/user.types";

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