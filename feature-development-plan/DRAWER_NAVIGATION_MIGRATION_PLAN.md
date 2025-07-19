# Drawer Navigator Integration Guide (Expo Router + React Navigation)

This guide provides a step-by-step, detailed approach to implementing a Drawer Navigator in your Expo Router/React Native app, with the Home screen and all tabs accessible, and a separate Settings page accessible only from the Drawer.

---

## 1. **Project Structure Overview**

Your current structure (after refactor):
```
app/
  _layout.tsx           # Root layout (Stack, providers)
  (tabs)/               # Tab group
    _layout.tsx         # Tab navigator
    index.tsx           # Home screen (tab)
    todo.tsx            # Other tabs...
    expenses.tsx
    friend.tsx
    calendar.tsx
  settings/             # Drawer-only settings page
    index.tsx           # Settings screen (not in tabs)
  navigation/
    DrawerNavigator.tsx  # Drawer navigator component (to be created)
```

---

## 2. **Drawer Navigator Implementation Plan**

### **A. Create the Drawer Navigator Component**

1. **Create `app/navigation/DrawerNavigator.tsx`:**
   - Use `@react-navigation/drawer`.
   - The Drawer should have:
     - Home (which loads the tab navigator)
     - Settings (which loads the settings page)

```tsx
// app/navigation/DrawerNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Tabs } from 'expo-router';
import SettingsScreen from '../settings'; // or '../settings/index'

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen
        name="Home"
        options={{ drawerLabel: 'Home', title: 'Home' }}
        // Render the tab navigator as the Home screen
        children={() => <Tabs />} 
      />
      <Drawer.Screen
        name="Settings"
        options={{ drawerLabel: 'Settings', title: 'Settings' }}
        component={SettingsScreen}
      />
    </Drawer.Navigator>
  );
}
```

- **Note:** If you want to use Expo Router's file-based routing for Settings, you can use `import SettingsScreen from '../settings';` or use a dynamic import.

---

### **B. Update the Root Layout to Use the Drawer**

1. **Edit `app/_layout.tsx`:**
   - Replace the Stack with your DrawerNavigator as the root navigator.
   - Keep all providers (QueryClientProvider, AuthProvider, etc.) wrapping the Drawer.

```tsx
// ...existing imports...
import DrawerNavigator from './navigation/DrawerNavigator';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DrawerNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

---

### **C. Remove Settings from the Tab Bar**

1. **Edit `app/(tabs)/_layout.tsx`:**
   - Remove the `settings` tab from the `<Tabs>` navigator.
   - Only include tabs you want in the bottom tab bar (e.g., Home, Todo, Expenses, Friend, Calendar).

---

### **D. Create the Settings Page (if not already present)**

1. **Create `app/settings/index.tsx`:**
   - This will be the settings screen shown when the user selects Settings from the Drawer.
   - You already have a settings screen; just ensure it's not in the tabs group.

---

### **E. Add a Drawer Menu Button to Tab Screens**

1. **Add a hamburger/menu button to the header of each tab screen:**
   - Use the `headerLeft` option in the tab navigator or in each screen to add a button that opens the Drawer.
   - Example for Expo Router Tabs:

```tsx
<Tabs.Screen
  name="index"
  options={{
    title: 'Home',
    tabBarIcon: ...,
    headerLeft: ({ tintColor }) => (
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 16 }}>
        <Ionicons name="menu" size={24} color={tintColor || '#222'} />
      </TouchableOpacity>
    ),
  }}
/>
```
- You may need to use the `useNavigation` hook from `@react-navigation/native` to get the navigation object.

---

### **F. Test the Drawer Integration**

- Run the app and verify:
  - The Drawer is accessible from all tab screens (via the hamburger menu).
  - Home and all tabs are accessible as before.
  - Settings is only accessible from the Drawer, not from the tab bar.
  - Navigation between Drawer and Tabs works seamlessly.

---

## 3. **Best Practices & Troubleshooting**

- **Providers:** Always wrap the DrawerNavigator with your providers in `_layout.tsx`.
- **Navigation:** Use the same navigation object for opening the Drawer from tab screens.
- **Accessibility:** Ensure the Drawer is accessible via screen readers and the hamburger button is labeled.
- **File Structure:** Keep Drawer-only screens (like Settings) outside the tabs group.
- **Testing:** Test on both iOS and Android for Drawer gesture and appearance.

---

## 4. **Summary Checklist**

- [ ] Create `navigation/DrawerNavigator.tsx` with Home (Tabs) and Settings
- [ ] Update `_layout.tsx` to use DrawerNavigator as root
- [ ] Remove Settings from tab bar in `(tabs)/_layout.tsx`
- [ ] Ensure `settings/index.tsx` exists and is not in tabs
- [ ] Add hamburger menu button to tab headers
- [ ] Test navigation and polish UI

---

**You now have a scalable, idiomatic Drawer + Tabs navigation structure, with a dedicated Settings page in the Drawer!**
