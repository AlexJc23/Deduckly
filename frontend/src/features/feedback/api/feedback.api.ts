import { FeedbackRequest } from "../types/feedback.types";

import { api } from "@/api/client";

export async function submitFeedback(
  data: FeedbackRequest,
) {
  return api.post(
    "/api/v1/feedback",
    data,
  );
}