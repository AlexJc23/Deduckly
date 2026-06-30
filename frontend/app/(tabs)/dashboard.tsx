import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { checkHealth } from "@/services/health_service";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { router } from "expo-router";
import { StartTripModal } from "@/features/tracking/components/StartTripModal";
import { useTracking } from "@/features/tracking/context/tracking.context";

export default function DashboardScreen() {
  const userQuery = useCurrentUser();

  const [showStartTripModal, setShowStartTripModal] = useState(false)
  const { isTracking } = useTracking();


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

      {!isTracking ? (
        <Button
          title="Start Trip"
          onPress={() => setShowStartTripModal(true)}
        />
      ) : (
        <Button
        title="Trip in progress"
        onPress={() => router.push('/tracking/active')}
        />
      )}

      <StartTripModal
      visible={showStartTripModal}
      onClose={() => setShowStartTripModal(false)}
      />
    </View>
  );
}
