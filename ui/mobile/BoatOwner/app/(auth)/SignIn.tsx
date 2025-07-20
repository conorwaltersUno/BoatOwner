import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useSignIn } from "@/hooks/useSignIn";
import { FontAwesome5 } from "@expo/vector-icons";
import { saveTokens } from "@/utils/tokenStorage";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

type SignInScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignIn">;
};

// If using Expo Router or React Navigation, wrap the component with <Screen> and set headerShown: false
// @ts-ignore
export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [form, setForm] = useState({ email: "", password: "" });
  const { mutateAsync, isPending, error } = useSignIn();
  const { setAuthenticated } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const handleSignIn = async () => {
    try {
      const data = await mutateAsync(form);
      const { accessToken, refreshToken, userId, boatId } = data;
      await saveTokens(accessToken, refreshToken, userId, boatId);
      setAuthenticated(true);
      router.replace("/(tabs)");
    } catch (err) {
      // error is handled by react-query
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.logoContainer, { marginBottom: 32 }]}> {/* Adjusted margin for spacing */}
        <FontAwesome5 name="ship" size={64} color={theme.text} />
      </View>
      <ThemedText style={{ color: theme.primary, fontWeight: "bold", fontSize: 22, textAlign: "center", marginBottom: 24 }}>
        Boat Owner
      </ThemedText>
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(email) => setForm((f) => ({ ...f, email }))}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={theme.text + '99'}
      />
      <TextInput
        placeholder="Password"
        value={form.password}
        onChangeText={(password) => setForm((f) => ({ ...f, password }))}
        secureTextEntry
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholderTextColor={theme.text + '99'}
      />
      {error && <ThemedText style={[styles.error, { color: '#e74c3c' }]}>{error.message}</ThemedText>}
      <Button title={isPending ? "Signing In..." : "Sign In"} onPress={handleSignIn} color={theme.primary} />
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ThemedText style={[styles.dividerText, { color: theme.text + '99' }]}>or</ThemedText>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      </View>
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#000' }]} activeOpacity={0.7}>
        <ThemedText style={[styles.socialButtonText, { color: '#fff' }]}>Sign in with Apple</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.socialButton, styles.googleButton, { backgroundColor: theme.card, borderColor: theme.border }]} activeOpacity={0.7}>
        <ThemedText style={[styles.socialButtonText, { color: theme.text }]}>Sign in with Google</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/(auth)/SignUp")}>
        <ThemedText style={[styles.signupText, { color: theme.primary }]}>Don't have an account? Sign Up</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

// For Expo Router: (if using file-based routing)
// <Screen options={{ headerShown: false }} />
// For React Navigation Stack: (if using stack)
// options={{ headerShown: false }}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  logoContainer: { alignItems: "center", marginBottom: 32 }, // Increased marginBottom for spacing
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  input: {
    borderWidth: 1,
    marginBottom: 14,
    padding: 10,
    borderRadius: 8,
  },
  error: { marginBottom: 8, textAlign: "center" },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 10 },
  socialButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  socialButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  signupText: {
    textAlign: "center",
    marginTop: 18,
    fontWeight: "500",
    fontSize: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
});
