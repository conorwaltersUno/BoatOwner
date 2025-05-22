import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSignUp } from "@/hooks/useSignUp";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignUp">;
};

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [form, setForm] = useState({ email: "", password: "", boat_name: "", boat_model: "" });
  const { mutate, isPending, error, data } = useSignUp();
  const { setAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (data) {
      setAuthenticated(true);
      router.replace("/(tabs)/(home)");
    }
  }, [data]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <FontAwesome5 name="ship" size={64} color="#2E66E7" />
      </View>
      <Text style={styles.title}>Create your BoatOwner account</Text>
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(email) => setForm((f) => ({ ...f, email }))}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={form.password}
        onChangeText={(password) => setForm((f) => ({ ...f, password }))}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Boat Name"
        value={form.boat_name}
        onChangeText={(boat_name) => setForm((f) => ({ ...f, boat_name }))}
        style={styles.input}
      />
      <TextInput
        placeholder="Boat Model"
        value={form.boat_model}
        onChangeText={(boat_model) => setForm((f) => ({ ...f, boat_model }))}
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button title={isPending ? "Signing Up..." : "Sign Up"} onPress={() => mutate(form)} />
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>
      <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
        <Text style={styles.socialButtonText}>Sign up with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.socialButton, styles.googleButton]} activeOpacity={0.7}>
        <Text style={styles.socialButtonText}>Sign up with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/(auth)/SignIn")}>
        <Text style={styles.signinText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f9f9f9" },
  logoContainer: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#2E66E7", textAlign: "center", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    marginBottom: 14,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  error: { color: "#e74c3c", marginBottom: 8, textAlign: "center" },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  divider: { flex: 1, height: 1, backgroundColor: "#e0e0e0" },
  dividerText: { marginHorizontal: 10, color: "#888" },
  socialButton: {
    backgroundColor: "#222",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  socialButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  signinText: {
    color: "#2E66E7",
    textAlign: "center",
    marginTop: 18,
    fontWeight: "500",
    fontSize: 15,
  },
});
