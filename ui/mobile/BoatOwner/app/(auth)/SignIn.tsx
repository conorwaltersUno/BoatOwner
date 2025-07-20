import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useSignIn } from "@/hooks/useSignIn";
import { FontAwesome5 } from "@expo/vector-icons";
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
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
  const [showPassword, setShowPassword] = useState(false);
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
      <View style={{ position: 'relative' }}>
        <TextInput
          placeholder="Password"
          value={form.password}
          onChangeText={(password) => setForm((f) => ({ ...f, password }))}
          secureTextEntry={!showPassword}
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border, paddingRight: 44 }]}
          placeholderTextColor={theme.text + '99'}
        />
        {form.password.length > 0 && (
          <TouchableOpacity
            style={{ position: 'absolute', right: 16, top: -5, bottom: 0, height: '100%', justifyContent: 'center'}}
            onPress={() => setShowPassword((v) => !v)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={theme.text + '99'} />
          </TouchableOpacity>
        )}
      </View>
      {error && <ThemedText style={[styles.error, { color: '#e74c3c' }]}>{error.message}</ThemedText>}
      <Button title={isPending ? "Signing In..." : "Sign In"} onPress={handleSignIn} color={theme.primary} />
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ThemedText style={[styles.dividerText, { color: theme.text + '99' }]}>or</ThemedText>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      </View>
      {/* Apple Sign In Button (iOS only) */}
      {Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.appleButton} activeOpacity={0.8}>
          <AntDesign name="apple1" size={22} color="#fff" style={{ marginRight: 8 }} />
          <ThemedText style={styles.appleButtonText}>Sign in with Apple</ThemedText>
        </TouchableOpacity>
      )}
      {/* Google Sign In Button (Android only) */}
      {Platform.OS === 'android' && (
        <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
          <AntDesign name="google" size={22} color="#fff" style={{ marginRight: 8 }} />
          <ThemedText style={styles.googleButtonText}>Sign in with Google</ThemedText>
        </TouchableOpacity>
      )}
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
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  appleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4', // Google blue
    borderWidth: 0,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
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
