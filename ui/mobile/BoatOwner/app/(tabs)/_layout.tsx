import { Tabs } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function TabLayout() {
  const { theme } = useTheme();
  return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.text + '99',
          tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
          headerStyle: { backgroundColor: theme.background },
          headerTitleStyle: { color: theme.text },
        }}
      >
        <Tabs.Screen
          name="todo"
          options={{
            title: "Todo's",
            tabBarIcon: ({ color, size }) => <FontAwesome name="sort-amount-asc" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size ?? 28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: "Expenses",
            tabBarIcon: ({ color, size }) => <FontAwesome name="dollar" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="friend"
          options={{
            title: "Friends",
            tabBarIcon: ({ color, size }) => <Ionicons name="people-circle" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
          }}
        />
      </Tabs>
  );
}
