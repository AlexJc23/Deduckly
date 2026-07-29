import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUser } from "../api/user.api";
import { router } from "expo-router";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUser,

    onSuccess: () => {
      queryClient.invalidateQueries();
      router.back()
    },
  });
}