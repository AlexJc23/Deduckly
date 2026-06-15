import { useEffect } from "react";
import { View, Text, Button } from "react-native";
import { checkHealth } from "@/services/health_service";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";


export default function DashboardScreen() {
  const userQuery = useCurrentUser();



  useEffect(() => {
    async function testConnection() {
      try {
        const data = await checkHealth();
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    }

    testConnection();
  }, []);


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Dashboard</Text>
      {userQuery.data && (
        <Text>
          Welcome, {userQuery.data.first_name} {userQuery.data.last_name}!
        </Text>
      )}
      <Button
      title="Refresh User"
      onPress={() => {
        userQuery.refetch();
      }}
    />
    </View>
  );
}
