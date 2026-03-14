import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface NeoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: 'neon' | 'accent' | 'amber' | 'red' | 'none';
  glow?: boolean;
}

export function NeoCard({ children, style, accent = 'none', glow = false }: NeoCardProps) {
  const accentColors: Record<string, string> = {
    neon: Colors.neon,
    accent: Colors.accent,
    amber: Colors.amber,
    red: Colors.red,
    none: Colors.border,
  };

  return (
    <View
      style={[
        styles.card,
        { borderColor: accentColors[accent] },
        glow && accent !== 'none' && {
          shadowColor: accentColors[accent],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        },
        style,
      ]}
    >
      {accent !== 'none' && (
        <View style={[styles.accentBar, { backgroundColor: accentColors[accent] }]} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentBar: {
    height: 2,
    width: '100%',
  },
});
