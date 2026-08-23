import { api } from "@/api/client";

export type SyncSubscriptionPayload = {
  product_id: string;
  original_transaction_id: string;
  latest_transaction_id: string;
  environment: string;
  purchase_date: string;
  expiration_date: string;
  auto_renew: boolean;
  apple_response?: Record<string, unknown>;
};

export async function syncSubscription(
  payload: SyncSubscriptionPayload,
) {
  const response = await api.post(
    "/api/v1/subscriptions/sync",
    payload,
  );

  return response.data;
}