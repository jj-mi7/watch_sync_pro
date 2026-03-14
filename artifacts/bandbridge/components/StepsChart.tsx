import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/colors';
import { DailyStats } from '@/context/AppContext';

interface StepsChartProps {
  stats: DailyStats[];
  metric: 'steps' | 'calories' | 'km';
}

const METRIC_CONFIG = {
  steps: { label: 'Steps', color: Colors.neon, suffix: '' },
  calories: { label: 'Calories', color: Colors.amber, suffix: 'kcal' },
  km: { label: 'Distance', color: Colors.accent, suffix: 'km' },
};

export function StepsChart({ stats, metric }: StepsChartProps) {
  const config = METRIC_CONFIG[metric];
  const screenWidth = Dimensions.get('window').width - 32;

  const last7 = [...stats].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

  const labels = last7.map(s => {
    const d = new Date(s.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  const data = last7.map(s => {
    const val = s[metric];
    return typeof val === 'number' ? Math.round(val * 10) / 10 : 0;
  });

  if (data.every(v => v === 0)) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No data yet — sync your watch to see charts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: labels.length > 0 ? labels : ['—'],
          datasets: [{ data: data.length > 0 ? data : [0] }],
        }}
        width={screenWidth}
        height={160}
        yAxisSuffix={config.suffix ? ` ${config.suffix}` : ''}
        withDots={true}
        withInnerLines={false}
        withOuterLines={false}
        withShadow={true}
        chartConfig={{
          backgroundColor: Colors.bgCard,
          backgroundGradientFrom: Colors.bgCard,
          backgroundGradientTo: Colors.bgCard,
          decimalPlaces: metric === 'km' ? 2 : 0,
          color: (opacity = 1) => `${config.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
          labelColor: () => Colors.textMuted,
          strokeWidth: 2.5,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: config.color,
            fill: Colors.bg,
          },
          propsForBackgroundLines: {
            stroke: 'transparent',
          },
        }}
        bezier
        style={{ borderRadius: 12, paddingRight: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -4,
  },
  empty: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
