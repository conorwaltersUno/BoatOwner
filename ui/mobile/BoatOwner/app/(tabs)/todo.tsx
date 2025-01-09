import { View, Text, StyleSheet } from "react-native";

export default function todo() {
  return (
    <View style={styles.container}>
      <Text>To-do's</Text>
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
