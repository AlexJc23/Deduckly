import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Button
} from "react-native";
import { useTrip } from "@/features/trips/hooks/use-trips";
import { router } from "expo-router"
import { useLocalSearchParams } from "expo-router";
import { useQueryClient }
  from "@tanstack/react-query";

import { useDeleteTrip }
  from "@/features/trips/hooks/use-delete-trip";

export default function TripDetailsScreen() {
    const queryClient = useQueryClient();
    const { id } = useLocalSearchParams()

    const deleteMutation = useDeleteTrip();

    const tripsQuery = useTrip(Number(id))
    const trip = tripsQuery.data;

    if (tripsQuery.isPending) {
        return (
            <ActivityIndicator />
        )
    }

    if (tripsQuery.isError) {
        return (
            <Text>
                Failed to load trip
            </Text>
        )
    }

    return (
        <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 200
            }}
        >

            <Text>
                Trip Details {id}
            </Text>
            <Text>
                {trip?.distance_miles} miles
            </Text>

            <Text>
                {trip?.platform}
            </Text>

            <Text>
                {trip?.category}
            </Text>
            <Text>
                {trip?.start_address}
                {trip?.end_address}
            </Text>
            <Button
                title={"Back"}
                onPress={() => router.back()}
            />
            <Button
                title="Delete Trip"
                onPress={() => {
                    deleteMutation.mutate(
                    Number(id),
                    {
                        onSuccess: async () => {
                        await queryClient.invalidateQueries({
                            queryKey: ["trips"],
                        });
                        router.back();
                        },
                    }
                    );
                }}
            />
        </View>
    )
}
