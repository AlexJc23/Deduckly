import {
  View,
  Text,
  ActivityIndicator,
  Button,
  Pressable
} from "react-native";
import { useTrip } from "@/features/trips/hooks/use-trips";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useDeleteTrip } from "@/features/trips/hooks/use-delete-trip";
import { useState } from "react";
import { DeleteTripModal } from "@/features/trips/components/DeleteTripModal";

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();

  const deleteMutation = useDeleteTrip();
  const tripsQuery = useTrip(Number(id));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const trip = tripsQuery.data;

  if (tripsQuery.isPending) {
    return <ActivityIndicator />;
  }

  if (tripsQuery.isError) {
    return <Text>Failed to load trip</Text>;
  }

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 200,
      }}
    >
      <Text>Trip Details {trip?.id}</Text>
      <Text>{trip?.distance_miles} miles</Text>
      <Text>{trip?.platform}</Text>
      <Text>{trip?.category}</Text>
      <Text>
        {trip?.start_address}
        {trip?.end_address}
      </Text>
      <Button title="Back" onPress={() => router.back()} />
      <Pressable onPress={() => setShowDeleteModal(true)}>
        <Text>Delete Trip</Text>
      </Pressable>
      <DeleteTripModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={async () => {
          setShowDeleteModal(false);

          if (!trip?.id) {
            return;
          }

          await deleteMutation.mutateAsync(trip.id);

          router.replace("/(tabs)/trips");
        }}
      />
    </View>
  );
}
