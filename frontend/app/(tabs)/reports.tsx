import FreeTierReportScreen from "app/reports/FreeTierReport";
import PremiumReportScreen from "app/reports/PremiumReport";

import { PremiumGate } from "@/features/subscriptions/components/PremiumGate";

export default function ReportsScreen() {
  return (
    <PremiumGate fallback={<FreeTierReportScreen />}>
      <PremiumReportScreen />
    </PremiumGate>
  );
}