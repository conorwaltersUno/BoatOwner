import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { useSignUp } from "@/hooks/useSignUp";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

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
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(email) => setForm((f) => ({ ...f, email }))}
        style={styles.input}
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
      <Button title="Already have an account? Sign In" onPress={() => router.replace("/(auth)/SignIn")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  input: { borderWidth: 1, marginBottom: 12, padding: 8, borderRadius: 4 },
  error: { color: "red", marginBottom: 8 },
});
