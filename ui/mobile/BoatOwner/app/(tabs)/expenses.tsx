import { View, Text, StyleSheet } from "react-native";

export default function expenses() {
  return (
    <View style={styles.container}>
      <Text>Expenses</Text>
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
