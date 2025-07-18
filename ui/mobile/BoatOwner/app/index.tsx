import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function AppEntry() {
  const { isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace("/(auth)/SignIn");
      } else {
        router.replace("/(tabs)/(home)");
      }
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
