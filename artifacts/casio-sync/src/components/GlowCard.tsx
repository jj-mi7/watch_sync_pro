import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '../theme';

interface GlowCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  noPadding?: boolean;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  style,
  glowColor = Colors.primaryGlow,
  noPadding = false,
}) => {
  return (
    <View style={[styles.container, { shadowColor: glowColor }, style]}>
      <View style={[styles.inner, noPadding && styles.noPadding]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: Spacing.md,
  },
  inner: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  noPadding: {
    padding: 0,
    overflow: 'hidden',
  },
});
