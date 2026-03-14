import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface ConnectionPulseProps {
  connected: boolean;
  scanning?: boolean;
  size?: number;
}

export function ConnectionPulse({ connected, scanning = false, size = 12 }: ConnectionPulseProps) {
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(1);

  const color = connected ? Colors.neon : scanning ? Colors.amber : Colors.textMuted;

  useEffect(() => {
    if (scanning) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.8, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
        false,
      );
      opacity.value = withRepeat(
        withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
        false,
      );
    } else if (connected) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.3, { duration: 1500 }), withTiming(1, { duration: 1500 })),
        -1,
        false,
      );
      opacity.value = withRepeat(
        withSequence(withTiming(0.5, { duration: 1500 }), withTiming(1, { duration: 1500 })),
        -1,
        false,
      );
    } else {
      pulse.value = 1;
      opacity.value = 1;
    }
  }, [connected, scanning]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { width: size * 2.5, height: size * 2.5 }]}>
      <Animated.View
        style={[
          styles.outer,
          outerStyle,
          {
            width: size * 2.5,
            height: size * 2.5,
            borderRadius: size * 1.25,
            backgroundColor: color,
            opacity: 0.15,
          },
        ]}
      />
      <View
        style={[
          styles.inner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    position: 'absolute',
  },
  inner: {
    position: 'absolute',
  },
});
