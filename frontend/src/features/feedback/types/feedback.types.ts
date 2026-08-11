export type FeedbackType =
  | "bug"
  | "feature"
  | "general";

export interface FeedbackRequest {
  type: FeedbackType;

  title: string;

  description: string;

  platform: string;

  osVersion: string | null;

  deviceName: string | null;

  appVersion: string | null;

  buildNumber: string | null;
}