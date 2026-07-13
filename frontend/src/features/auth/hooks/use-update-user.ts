import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUser } from "../api/user.api";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
    },
  });
}