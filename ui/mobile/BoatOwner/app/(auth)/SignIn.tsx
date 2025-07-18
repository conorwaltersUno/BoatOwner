import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useSignIn } from "@/hooks/useSignIn";
import { FontAwesome5 } from "@expo/vector-icons";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

type SignInScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignIn">;
};

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [form, setForm] = useState({ email: "", password: "" });
  const { mutate, isPending, error, data } = useSignIn();
  const { setAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (data) {
      setAuthenticated(true);
      router.replace("/(tabs)/(home)");
    }
  }, [data, router, setAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <FontAwesome5 name="ship" size={64} color="#000000" />
      </View>
      <Text style={styles.title}>BoatOwner</Text>
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
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button title={isPending ? "Signing In..." : "Sign In"} onPress={() => mutate(form)} />
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>
      <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
        <Text style={styles.socialButtonText}>Sign in with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.socialButton, styles.googleButton]} activeOpacity={0.7}>
        <Text style={styles.socialButtonText}>Sign in with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/(auth)/SignUp")}>
        <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f9f9f9" },
  logoContainer: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "bold", color: "#2E66E7", textAlign: "center", marginBottom: 24 },
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
  signupText: {
    color: "#2E66E7",
    textAlign: "center",
    marginTop: 18,
    fontWeight: "500",
    fontSize: 15,
  },
});
