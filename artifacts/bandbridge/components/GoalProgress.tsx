import { LinearGradient } from 'expo-linear-gradient';
import { Check, Trophy } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { DailyStats } from '@/context/AppContext';

interface GoalProgressProps {
  stats: DailyStats;
}

export function GoalProgress({ stats }: GoalProgressProps) {
  const progress = stats.goal > 0 ? Math.min(stats.steps / stats.goal, 1) : 0;
  const animProgress = useSharedValue(0);

  useEffect(() => {
    animProgress.value = withTiming(progress, { duration: 1200 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animProgress.value * 100}%`,
  }));

  const percent = Math.round(progress * 100);
  const isGoalMet = stats.steps >= stats.goal;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Daily Goal</Text>
          <Text style={styles.value}>
            {stats.steps.toLocaleString()}
            <Text style={styles.goal}> / {stats.goal.toLocaleString()} steps</Text>
          </Text>
        </View>
        <View style={[styles.badge, isGoalMet && styles.badgeSuccess]}>
          {isGoalMet && <Check size={12} color={Colors.bg} />}
          <Text style={[styles.badgeText, isGoalMet && { color: Colors.bg }]}>
            {percent}%
          </Text>
        </View>
      </View>

      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, barStyle]}>
          <LinearGradient
            colors={[Colors.neon, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.barGlow} />
        </Animated.View>

        {[0.25, 0.5, 0.75].map(marker => (
          <View
            key={marker}
            style={[styles.marker, { left: `${marker * 100}%` as any }]}
          />
        ))}
      </View>

      {isGoalMet && (
        <View style={styles.successMsg}>
          <Trophy size={14} color={Colors.amber} />
          <Text style={styles.successText}>Goal achieved! Keep going!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  goal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeSuccess: {
    backgroundColor: Colors.neon,
    borderColor: Colors.neon,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.neon,
  },
  barBg: {
    height: 10,
    backgroundColor: Colors.bgElevated,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  barGlow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: Colors.white,
    opacity: 0.3,
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.bg,
    opacity: 0.5,
  },
  successMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  successText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.amber,
  },
});
