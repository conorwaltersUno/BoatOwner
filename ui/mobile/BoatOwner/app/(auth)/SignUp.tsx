import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useSignUp } from "@/hooks/useSignUp";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignUp">;
};

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [form, setForm] = useState({ email: "", password: "", username: "", boat_name: "", boat_model: "" });
  const { mutateAsync, isPending, error } = useSignUp();
  const { setAuthenticated } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const handleSignUp = async () => {
    try {
      const data = await mutateAsync(form);
      setAuthenticated(true);
      router.replace("/(tabs)");
    } catch (err) {
      // error is handled by react-query
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }] }>
      <View style={styles.logoContainer}>
        <FontAwesome5 name="ship" size={64} color={theme.primary} />
      </View>
      <ThemedText style={[styles.title, { color: theme.primary }]}>Create your BoatOwner account</ThemedText>
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
      <TextInput
        placeholder="Username"
        value={form.username}
        onChangeText={(username) => setForm((f) => ({ ...f, username }))}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        autoCapitalize="none"
        placeholderTextColor={theme.text + '99'}
      />
      <TextInput
        placeholder="Boat Name"
        value={form.boat_name}
        onChangeText={(boat_name) => setForm((f) => ({ ...f, boat_name }))}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholderTextColor={theme.text + '99'}
      />
      <TextInput
        placeholder="Boat Model"
        value={form.boat_model}
        onChangeText={(boat_model) => setForm((f) => ({ ...f, boat_model }))}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholderTextColor={theme.text + '99'}
      />
      {error && <ThemedText style={[styles.error, { color: '#e74c3c' }]}>{error.message}</ThemedText>}
      <Button title={isPending ? "Signing Up..." : "Sign Up"} onPress={handleSignUp} color={theme.primary} />
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ThemedText style={[styles.dividerText, { color: theme.text + '99' }]}>or</ThemedText>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      </View>
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#000' }]} activeOpacity={0.7}>
        <ThemedText style={[styles.socialButtonText, { color: '#fff' }]}>Sign up with Apple</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.socialButton, styles.googleButton, { backgroundColor: theme.card, borderColor: theme.border }]} activeOpacity={0.7}>
        <ThemedText style={[styles.socialButtonText, { color: theme.text }]}>Sign up with Google</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/(auth)/SignIn")}> 
        <ThemedText style={[styles.signinText, { color: theme.primary }]}>Already have an account? Sign In</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  logoContainer: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "600", textAlign: "center", marginBottom: 24 },
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
  },
  socialButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  signinText: {
    textAlign: "center",
    marginTop: 18,
    fontWeight: "500",
    fontSize: 15,
  },
});
