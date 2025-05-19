import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { clearTokens } from "@/utils/tokenStorage";

export default function Settings() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    clearTokens();
    await signOut();
    router.replace("/(auth)/SignIn");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={20} color="#fff" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>BoatOwner App v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E66E7",
    marginBottom: 40,
    textAlign: "center",
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 70,
    alignSelf: "center",
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerText: {
    color: "#aaa",
    fontSize: 14,
  },
});
