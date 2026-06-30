
import { View, Text, Button, Pressable } from "react-native";
import { router } from 'expo-router'
import { useState } from "react";
import { EndTripModal } from "@/features/tracking/components/EndTripModal";

export default function ActiveTripScreen() {
    const [showEndModal, setShowEndModal] = useState(false);


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
        <Button title="Back"
        onPress={() => router.back()}

        />
      <Text>Active Trip</Text>
      <View>
        <Text>
            Duration
        </Text>
        <Text>
            00:00:00
        </Text>
        <Text>
            hh:mm:ss
        </Text>
      </View>
      <View>
        <Text>
            Distance
        </Text>
        <Text>
            0.0 mi
        </Text>
        <Text>
            miles tracked
        </Text>
      </View>


      <View>
        <Pressable
            onPress={() => setShowEndModal(true)}
            >
            <Text>Stop Trip</Text>
            <Text>End and Save Trip</Text>
        </Pressable>
      </View>
      <EndTripModal
        visible={showEndModal}
        onClose={() => setShowEndModal(false)}
      />

    </View>
  );
}
