import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Footprints, Route } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { DailyStats } from '@/context/AppContext';

interface StatsGridProps {
  stats: DailyStats;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  dimColor: string;
  progress: number;
  delay: number;
}

function StatItem({ icon, value, label, color, dimColor, progress, delay }: StatItemProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} style={[styles.statItem, { borderColor: color + '30' }]}>
      <LinearGradient
        colors={[dimColor, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.statHeader}>
        <View style={[styles.iconWrap, { backgroundColor: dimColor }]}>
          {icon}
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </Animated.View>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  const stepProgress = stats.goal > 0 ? stats.steps / stats.goal : 0;
  const calProgress = Math.min(stats.calories / 500, 1);
  const kmProgress = Math.min(stats.km / 5, 1);

  return (
    <View style={styles.grid}>
      <StatItem
        icon={<Footprints size={18} color={Colors.neon} />}
        value={stats.steps.toLocaleString()}
        label="Steps"
        color={Colors.neon}
        dimColor={Colors.neonDim}
        progress={stepProgress}
        delay={0}
      />
      <StatItem
        icon={<Flame size={18} color={Colors.amber} />}
        value={Math.round(stats.calories).toString()}
        label="Calories"
        color={Colors.amber}
        dimColor={Colors.amberDim}
        progress={calProgress}
        delay={80}
      />
      <StatItem
        icon={<Route size={18} color={Colors.accent} />}
        value={stats.km.toFixed(2)}
        label="Kilometers"
        color={Colors.accent}
        dimColor={Colors.accentDim}
        progress={kmProgress}
        delay={160}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    overflow: 'hidden',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    marginTop: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
