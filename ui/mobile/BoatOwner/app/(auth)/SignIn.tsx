import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useSignIn } from "@/hooks/useSignIn";

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
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button title={isPending ? "Signing In..." : "Sign In"} onPress={() => mutate(form)} />
      <Button title="Don't have an account? Sign Up" onPress={() => router.replace("/(auth)/SignUp")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  input: { borderWidth: 1, marginBottom: 12, padding: 8, borderRadius: 4 },
  error: { color: "red", marginBottom: 8 },
});
