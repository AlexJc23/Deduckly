import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePassword } from "../api/user.api";

export function useUpdatePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePassword,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
    },
  });
}