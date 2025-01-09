import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>This is the Home Page</Text>
      </View>
      <View style={styles.middle}>
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
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
