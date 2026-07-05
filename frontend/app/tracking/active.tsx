
import { View, Text, Button, Pressable } from "react-native";
import { router } from 'expo-router'
import { useState, useEffect } from "react";
import { EndTripModal } from "@/features/tracking/components/EndTripModal";
import { useTracking } from "@/features/tracking/context/tracking.context";
import { getCurrentLocation, requestLocationPermission } from "@/features/tracking/services/location.service";
import { IncomeModal } from "@/features/tracking/components/IncomeModal";



function formatTime(seconds: number) {
  const hours = Math.floor(
    seconds / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export default function ActiveTripScreen() {
    const [showEndModal, setShowEndModal] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const {category, platform, startTime, distanceMiles, stopTracking} = useTracking();
    const [showIncomeModal, setShowIncomeModal] = useState(false);

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            const seconds = Math.floor(
                (Date.now() - startTime.getTime()) / 1000
            );

            setElapsedSeconds(seconds)
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime])

    useEffect(() => {
        async function checkPermission() {
            const granted = await requestLocationPermission();
            const location = await getCurrentLocation();

            await getCurrentLocation();

        }

        checkPermission();
    }, []);


  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        marginTop: "75%"

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
            {formatTime(elapsedSeconds)}
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
            {distanceMiles.toFixed(2)} mi
        </Text>
        <Text>
            miles tracked
        </Text>
        <>
            <Text>{platform}</Text>
        </>
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
        onClose={() => {
          setShowEndModal(false)
        }}
        onConfirm={() => {
          setShowEndModal(false);

          setTimeout(() => {
            setShowIncomeModal(true);
          }, 350);
        }}
      />
      <IncomeModal
        visible={showIncomeModal}
        onSave={async (income) => {
          setShowIncomeModal(false);

          await stopTracking(income);

          router.replace({
            pathname: "/(tabs)/dashboard",
            params: {saved: "true"},
          });
        }}
        onSkip={async () => {
          setShowIncomeModal(false);

          await stopTracking(null);

          router.replace({
            pathname: "/(tabs)/dashboard",
            params: {saved: "true"},
          });
        }}
      />

    </View>
  );
}
