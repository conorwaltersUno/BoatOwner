import { TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

export function CustomBackButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
      <Text style={{ color: "black", fontWeight: "bold" }}>Back</Text>
    </TouchableOpacity>
  );
}
