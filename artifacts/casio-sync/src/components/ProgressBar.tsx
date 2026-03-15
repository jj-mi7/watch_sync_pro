import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii, Spacing, Typography } from '../theme';

interface ProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  formatValue?: (v: number) => string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  goal,
  unit,
  color,
  formatValue,
}) => {
  const pct = Math.min(current / goal, 1);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const displayCurrent = formatValue ? formatValue(current) : current.toLocaleString();
  const displayGoal = formatValue ? formatValue(goal) : goal.toLocaleString();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[Typography.bodySmall, styles.label]}>{label}</Text>
        <Text style={[Typography.bodySmall, { color }]}>
          {displayCurrent}{' '}
          <Text style={[Typography.bodySmall, styles.goal]}>/ {displayGoal} {unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    color: Colors.textSecondary,
  },
  goal: {
    color: Colors.textMuted,
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radii.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.round,
  },
});
