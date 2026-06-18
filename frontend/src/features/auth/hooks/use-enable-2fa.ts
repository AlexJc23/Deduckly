import { useMutation } from "@tanstack/react-query";
import { enable2FA } from "@/features/auth/api/auth.api";

export function useEnable2FA () {
    return useMutation({
        mutationFn: enable2FA,
    });
}
