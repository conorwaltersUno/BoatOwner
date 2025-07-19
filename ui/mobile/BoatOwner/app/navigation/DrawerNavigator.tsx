import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../(tabs)/index';
import FriendScreen from '../(tabs)/friend';
import ExpensesScreen from '../(tabs)/expenses';
import CalendarScreen from '../(tabs)/calendar';
import TodoScreen from '../(tabs)/todo';
import SettingsScreen from '../(tabs)/settings';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
        <Drawer.Screen name="Friends" component={FriendScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="people-circle" color={color} size={size} /> }} />
        <Drawer.Screen name="Expenses" component={ExpensesScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="cash-outline" color={color} size={size} /> }} />
        <Drawer.Screen name="Calendar" component={CalendarScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} /> }} />
        <Drawer.Screen name="Todo's" component={TodoScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} /> }} />
        <Drawer.Screen name="Settings" component={SettingsScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
