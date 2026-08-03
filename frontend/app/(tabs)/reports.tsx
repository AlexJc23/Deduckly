import FreeTierReportScreen from "app/reports/FreeTierReport";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import PremiumReportScreen from "app/reports/PremiumReport";


export default function FreeTierReportsScreen() {

  const isPremium = false; // Replace with actual logic to determine if the user is premium

  const userQuery = useCurrentUser();


  return !isPremium ? <FreeTierReportScreen /> : <PremiumReportScreen />;
}