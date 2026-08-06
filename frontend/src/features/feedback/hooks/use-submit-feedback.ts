import { useMutation } from "@tanstack/react-query";

import { submitFeedback } from "../api/feedback.api";

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: submitFeedback,
  });
}