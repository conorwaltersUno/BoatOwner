import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CollapsibleSectionProps {
  title: React.ReactNode; // changed from string to React.ReactNode
  children: React.ReactNode;
  initiallyCollapsed?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, initiallyCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setCollapsed(c => !c)}>
        {/* Render the custom title node directly */}
        {title}
        <Ionicons name={collapsed ? 'chevron-down' : 'chevron-up'} size={20} color="#2E66E7" />
      </TouchableOpacity>
      {!collapsed && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    backgroundColor: '#fff',
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
    backgroundColor: '#e0e7ff',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E66E7',
  },
  content: {
    padding: 10,
  },
});

export default CollapsibleSection;
