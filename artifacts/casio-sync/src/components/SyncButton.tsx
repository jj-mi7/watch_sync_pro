import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, Radii, Spacing, Typography } from '../theme';

interface SyncButtonProps {
  onPress: () => void;
  isSyncing: boolean;
  disabled?: boolean;
}

export const SyncButton: React.FC<SyncButtonProps> = ({ onPress, isSyncing, disabled }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
        ]),
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [isSyncing]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.0],
  });

  return (
    <Animated.View
      style={[
        styles.glowWrapper,
        { shadowOpacity, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isSyncing}
        activeOpacity={0.85}
        style={[styles.button, (disabled || isSyncing) && styles.disabled]}
      >
        <Animated.Text style={[styles.icon, { transform: [{ rotate }] }]}>
          ↻
        </Animated.Text>
        <Text style={styles.label}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  glowWrapper: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    borderRadius: Radii.round,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.round,
    gap: Spacing.sm,
  },
  disabled: {
    backgroundColor: Colors.primaryDim,
    opacity: 0.7,
  },
  icon: {
    fontSize: 20,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  label: {
    ...Typography.h4,
    color: Colors.textInverse,
  },
});
