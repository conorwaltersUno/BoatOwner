import { View, Text, StyleSheet } from "react-native";

export default function logDetails() {
  return (
    <View style={styles.container}>
      <Text>Log Details</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
