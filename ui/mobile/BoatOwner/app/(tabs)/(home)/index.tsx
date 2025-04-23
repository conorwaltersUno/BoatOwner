import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import MapView, { Polyline, Region, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

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
  const [isFollowingUser, setIsFollowingUser] = useState(true);

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

        if (isFollowingUser) {
          mapRef.current?.animateToRegion(newRegion, 500);
        }

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
          followsUserLocation={isFollowingUser}
          onRegionChangeComplete={(newRegion) => {
            setRegion(newRegion);
            setZoomLevel({
              latitudeDelta: newRegion.latitudeDelta,
              longitudeDelta: newRegion.longitudeDelta,
            });
          }}
          onPanDrag={() => setIsFollowingUser(false)}
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

      <View style={styles.controlPanel}>
        {!watcher ? (
          <TouchableOpacity style={styles.logButton} onPress={startLogging}>
            <Text style={styles.detailsButtonText}>Start Logging</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.logButton, styles.stopButton]} onPress={stopLogging}>
            <Text style={styles.detailsButtonText}>Stop Logging</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => {
            Location.getCurrentPositionAsync({}).then((currentLocation) => {
              const newRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: zoomLevel.latitudeDelta,
                longitudeDelta: zoomLevel.longitudeDelta,
              };
              setRegion(newRegion);
              mapRef.current?.animateToRegion(newRegion, 500);
              setIsFollowingUser(true);
            });
          }}
        >
          <MaterialIcons name="my-location" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {watcher && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controlPanelRow: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  controlPanel: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  recenterButton: {
    position: "absolute",
    right: 30,
    bottom: 40,
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  recenterButtonInline: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  logButton: {
    backgroundColor: "#34C759",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  stopButton: {
    backgroundColor: "#FF3B30",
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  timerContainer: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
});
