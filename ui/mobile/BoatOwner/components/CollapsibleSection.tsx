import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  initiallyCollapsed?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, initiallyCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}> {/* Themed background */}
      <TouchableOpacity style={[styles.header, { backgroundColor: theme.background }]} onPress={() => setCollapsed(c => !c)}>
        <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>
        <Ionicons name={collapsed ? 'chevron-down' : 'chevron-up'} size={20} color={theme.primary} />
      </TouchableOpacity>
      {!collapsed && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 10,
  },
});

export default CollapsibleSection;
