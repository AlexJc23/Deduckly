import FreeTierReportScreen from "app/reports/FreeTierReport";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import PremiumReportScreen from "app/reports/PremiumReport";


export default function FreeTierReportsScreen() {

  const isPremium = true;

  const userQuery = useCurrentUser();


  return !isPremium ? <FreeTierReportScreen /> : <PremiumReportScreen />;
}