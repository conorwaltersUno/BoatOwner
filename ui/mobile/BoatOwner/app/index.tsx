import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { clearTokens } from "@/utils/tokenStorage";

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
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
