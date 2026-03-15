import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography } from '../theme';

interface StatRingProps {
  percent: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
  value: string;
  sublabel?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const StatRing: React.FC<StatRingProps> = ({
  percent,
  size,
  strokeWidth,
  color,
  label,
  value,
  sublabel,
}) => {
  const animVal = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: percent / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const strokeDashoffset = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference * (1 - percent / 100)],
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={[Typography.monoLarge, styles.value, { color }]}>{value}</Text>
        <Text style={[Typography.label, styles.label]}>{label}</Text>
        {sublabel && (
          <Text style={[Typography.caption, styles.sublabel]}>{sublabel}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  label: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sublabel: {
    color: Colors.textMuted,
    marginTop: 2,
  },
});
