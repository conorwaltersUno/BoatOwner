import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const [isRecordingLocation, setIsRecordingLocation] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>This is the Home Page</Text>
        <Text style={styles.headerText}>
          {isRecordingLocation ? "Currently recording location" : "Currently not recording location"}
        </Text>
      </View>
      <View style={styles.middle}>
        <TouchableOpacity style={styles.LocationButton} onPress={() => setIsRecordingLocation(!isRecordingLocation)}>
          <Text style={styles.detailsButtonText}>Record Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton} onPress={() => router.push("/logDetails")}>
          <Text style={styles.detailsButtonText}>View log details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
  },
  middle: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  LocationButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: "20%",
  },
  detailsButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: "30%",
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
