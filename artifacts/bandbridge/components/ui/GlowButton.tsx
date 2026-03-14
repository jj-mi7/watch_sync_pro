import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function GlowButton({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, style, fullWidth = false,
}: GlowButtonProps) {
  const variantStyles = {
    primary: {
      bg: Colors.neon,
      text: Colors.bg,
      shadow: Colors.neon,
    },
    secondary: {
      bg: Colors.bgElevated,
      text: Colors.textPrimary,
      shadow: Colors.accent,
      border: Colors.borderAccent,
    },
    danger: {
      bg: Colors.redDim,
      text: Colors.red,
      shadow: Colors.red,
      border: Colors.red,
    },
    ghost: {
      bg: 'transparent',
      text: Colors.textSecondary,
      shadow: 'transparent',
    },
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13, borderRadius: 8 },
    md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15, borderRadius: 10 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 16, borderRadius: 12 },
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
          borderWidth: 'border' in v ? 1 : 0,
          borderColor: 'border' in v ? (v as any).border : 'transparent',
          opacity: (pressed || disabled) ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          shadowColor: v.shadow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: variant === 'primary' ? 0.6 : 0.3,
          shadowRadius: 10,
          elevation: variant === 'primary' ? 6 : 2,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: v.text, fontSize: s.fontSize }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
});
