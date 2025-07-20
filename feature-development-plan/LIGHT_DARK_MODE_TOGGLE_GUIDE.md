# Light/Dark Mode Toggle Implementation Guide (React Native)

## Overview
This guide explains how to implement a global light/dark mode toggle in the BoatOwner mobile app, allowing users to switch themes from the Settings page. All app colors will be controlled from a single location for easy maintenance and consistency.

---

## 1. **Project Structure & Prerequisites**
- **Location:** All theming logic and color definitions will live in `ui/mobile/BoatOwner/constants/theme.ts` (or similar).
- **Context:** Theme state and toggle logic will be managed via React Context (`ui/mobile/BoatOwner/context/ThemeContext.tsx`).
- **Usage:** All components/screens will consume theme values from context or a custom hook.
- **UI:** The Settings page will provide a toggle (switch/button) for users to change the theme.
- **Persistence:** The selected theme will be saved in `AsyncStorage` so it persists across app restarts.

---

## 2. **Step-by-Step Implementation**

### **Step 1: Define Theme Colors**
- Create a file: `ui/mobile/BoatOwner/constants/theme.ts`
- Export a `lightTheme` and `darkTheme` object, each with all color values (background, text, primary, etc).
- Example:
```ts
export const lightTheme = {
  background: '#fff',
  text: '#222',
  primary: '#2E66E7',
  card: '#f7f9fc',
  border: '#e3e8f0',
  // ...add all colors used in the app
};

export const darkTheme = {
  background: '#181A20',
  text: '#f7f7f7',
  primary: '#4F8EF7',
  card: '#23242a',
  border: '#333',
  // ...add all colors used in the app
};
```

### **Step 2: Create Theme Context**
- Create `ui/mobile/BoatOwner/context/ThemeContext.tsx`.
- Provide `theme`, `isDark`, and a `toggleTheme` function.
- On mount, load the theme from `AsyncStorage`.
- Example:
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem('theme').then(val => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);
  const toggleTheme = () => {
    setIsDark(d => {
      AsyncStorage.setItem('theme', !d ? 'dark' : 'light');
      return !d;
    });
  };
  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);
```

### **Step 3: Wrap App in ThemeProvider**
- In your app entry (e.g. `App.tsx`), wrap the root with `<ThemeProvider>`.
- Example:
```tsx
import { ThemeProvider } from './context/ThemeContext';
export default function App() {
  return (
    <ThemeProvider>
      {/* ...existing code... */}
    </ThemeProvider>
  );
}
```

### **Step 4: Use Theme in Components**
- Replace hardcoded colors with `const { theme } = useTheme();` in all components/screens.
- Example:
```tsx
const { theme } = useTheme();
<View style={{ backgroundColor: theme.background }}>
  <Text style={{ color: theme.text }}>Hello</Text>
</View>
```
- For `StyleSheet.create`, use a function that takes `theme` as a parameter.

### **Step 5: Add Toggle to Settings Page**
- In your Settings screen, import `useTheme` and show a Switch or Button:
```tsx
const { isDark, toggleTheme } = useTheme();
<Switch value={isDark} onValueChange={toggleTheme} />
<Text>{isDark ? 'Dark' : 'Light'} Mode</Text>
```

### **Step 6: Test and Refactor**
- Test toggling the theme and ensure all screens/components update instantly.
- Refactor all color usage to use the theme context.
- Optionally, support system theme detection (see React Native Appearance API).

---

## 3. **Best Practices**
- **Centralize all color values** in the theme file.
- **Never hardcode colors** in components—always use the theme.
- **Persist user preference** with AsyncStorage.
- **Test accessibility** (contrast, readability) in both modes.
- **Document** new theme keys and usage for future devs.

---

## 4. **Advanced (Optional)**
- Add system theme auto-detection (see `react-native-appearance`).
- Animate theme transitions for a smoother UX.
- Add more granular theme keys (button, error, success, etc).

---

## 5. **References**
- [React Native Theming Patterns](https://reactnative.dev/docs/appearance)
- [AsyncStorage Docs](https://react-native-async-storage.github.io/async-storage/)
- [React Context API](https://reactjs.org/docs/context.html)

---

**After following this guide, your app will have a robust, maintainable, and user-friendly light/dark mode toggle!**
