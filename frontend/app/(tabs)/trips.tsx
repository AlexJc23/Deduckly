import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
} from "react-native";
import { useTrips } from "@/features/trips/hooks/use-trips";
import { router } from "expo-router";


export default function TripsScreen() {
  const tripsQuery = useTrips();
  if (tripsQuery.isPending) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator />
    </View>
  );
}
if (tripsQuery.isError) {
  return (
    <View>
      <Text>
        Failed to load trips
      </Text>
    </View>
  );
}
if (
  !tripsQuery.data ||
  tripsQuery.data.length === 0
) {
  return (
    <View>
      <Text>
        No trips found
      </Text>
    </View>
  );
}

return (
  <FlatList
    data={tripsQuery.data}
    keyExtractor={(item) =>
      item.id.toString()
    }
    renderItem={({ item }) => (
      <Pressable
        onPress={() =>
          router.push(
            `/trips/${item.id}/`
          )
        }
        style={{
          padding: 25,
          borderBottomWidth: 1,
        }}
      >
        <Text>
          {item.distance_miles} miles
        </Text>


        <Text>
          {new Date(item.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })}
          {item.platform ?? item.category}
        </Text>
      </Pressable>
    )}
  />
);
}
