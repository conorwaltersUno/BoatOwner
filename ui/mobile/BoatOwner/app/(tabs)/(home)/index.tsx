import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useEffect, useRef, useState } from "react";
import MapView, { Polyline, Region, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [watcher, setWatcher] = useState<Location.LocationSubscription | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [locations, setLocations] = useState<
    { index: number; latitude: number; longitude: number; timestamp: string }[]
  >([]);
  const [zoomLevel, setZoomLevel] = useState({ latitudeDelta: 0.01, longitudeDelta: 0.01 });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      const initialRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        ...zoomLevel,
      };
      setRegion(initialRegion);
    })();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (watcher) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => clearInterval(timer);
  }, [watcher]);

  const startLogging = async () => {
    if (watcher) return;

    setLocations([]);
    setSeconds(0);
    setStartTime(new Date());

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 0,
        distanceInterval: 1,
      },
      (newLoc) => {
        const { latitude, longitude } = newLoc.coords;
        setLocation(newLoc);

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: region?.latitudeDelta || zoomLevel.latitudeDelta,
          longitudeDelta: region?.longitudeDelta || zoomLevel.longitudeDelta,
        };

        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);

        setLocations((prev) => [
          ...prev,
          {
            index: prev.length,
            latitude,
            longitude,
            timestamp: new Date().toLocaleString(),
          },
        ]);
      }
    );

    setWatcher(subscription);
  };

  const stopLogging = () => {
    if (watcher) {
      watcher.remove();
      setWatcher(null);

      const endTime = new Date();
      const duration = seconds;
      const finalLocation = location?.coords;

      console.log("🟢 Start Time:", startTime?.toLocaleString());
      console.log("🛑 End Time:", endTime.toLocaleString());
      console.log("Duration (sec):", duration);
      console.log("Final Location:", {
        latitude: finalLocation?.latitude,
        longitude: finalLocation?.longitude,
        accuracy: finalLocation?.accuracy,
      });
      console.log("📍 Locations logged:", locations);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          showsUserLocation
          followsUserLocation={false}
          onRegionChangeComplete={(newRegion) => {
            setRegion(newRegion);
            setZoomLevel({
              latitudeDelta: newRegion.latitudeDelta,
              longitudeDelta: newRegion.longitudeDelta,
            });
          }}
        >
          {locations.length > 1 && (
            <Polyline
              coordinates={locations.map((loc) => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
              }))}
              strokeColor="#007AFF"
              strokeWidth={4}
            />
          )}
        </MapView>
      )}

      <View style={styles.middle}>
        {!watcher ? (
          <TouchableOpacity style={styles.logButton} onPress={startLogging}>
            <Text style={styles.detailsButtonText}>Begin Log</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={[styles.logButton, { backgroundColor: "#FF3B30" }]} onPress={stopLogging}>
              <Text style={styles.detailsButtonText}>Stop Log</Text>
            </TouchableOpacity>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 3 },
  middle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  logButton: {
    backgroundColor: "#34C759",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
});
