import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { clearTokens } from "@/utils/tokenStorage";
import { useTheme } from "@/context/ThemeContext";

export default function Settings() {
  const { signOut } = useAuth();
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    clearTokens();
    await signOut();
    router.replace("/(auth)/SignIn");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>Settings</Text>
      <View style={styles.themeRow}>
        <Text style={[styles.themeLabel, { color: theme.text }]}>Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          thumbColor={isDark ? theme.primary : "#f4f3f4"}
          trackColor={{ false: "#ccc", true: theme.primary }}
        />
      </View>
      <View style={styles.spacer} />
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.card }]} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={20} color={theme.primary} style={styles.logoutIcon} />
        <Text style={[styles.logoutText, { color: theme.primary }]}>Log Out</Text>
      </TouchableOpacity>
      <View style={[styles.footer, { backgroundColor: theme.background }] }>
        <Text style={[styles.footerText, { color: theme.text + '99' }]}>BoatOwner App v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  themeLabel: {
    fontSize: 18,
    fontWeight: "500",
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
    fontSize: 14,
  },
});
