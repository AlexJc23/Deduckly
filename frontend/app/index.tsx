import { Redirect } from "expo-router";
import { AuthGate } from "@/features/auth/components/auth-gate";

export default function Index() {
  return <AuthGate />;
}
