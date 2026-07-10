import { useMutation } from "@tanstack/react-query";
import { deleteCurrentUser } from "../api/user.api";

export function useDeleteUser() {
  return useMutation({
    mutationFn: deleteCurrentUser,
  });
}