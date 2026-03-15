import React, { useCallback, useEffect } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { GlowCard } from '../components/GlowCard';
import { NeoHeader } from '../components/NeoHeader';
import { ProgressBar } from '../components/ProgressBar';
import { StatRing } from '../components/StatRing';
import { SyncButton } from '../components/SyncButton';
import { BleService } from '../services/BleService';
import { useStore } from '../store/useStore';
import { Colors, Spacing, Typography } from '../theme';
import { formatCalories, formatDistance, formatSteps, getLast7DaysData, getProgressPercent } from '../utils/helpers';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const {
    todayActivity,
    activityHistory,
    dailyGoal,
    activeDevice,
    isSyncing,
    setTodayActivity,
    setIsSyncing,
  } = useStore();

  const chartData = getLast7DaysData(activityHistory);

  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      let data = null;
      if (activeDevice?.connected) {
        data = await BleService.syncData(activeDevice);
      }
      if (!data) {
        data = BleService.generateMockSyncData();
      }
      setTodayActivity(data);
      if (activeDevice) {
        useStore.getState().updateDevice(activeDevice.id, { lastSynced: Date.now() });
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, activeDevice]);

  const steps = todayActivity?.steps ?? 0;
  const calories = todayActivity?.calories ?? 0;
  const km = todayActivity?.distanceKm ?? 0;

  const stepsPercent = getProgressPercent(steps, dailyGoal.steps);
  const calPercent = getProgressPercent(calories, dailyGoal.calories);
  const kmPercent = getProgressPercent(km, dailyGoal.distanceKm);

  const avgPercent = Math.round((stepsPercent + calPercent + kmPercent) / 3);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isSyncing}
          onRefresh={handleSync}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      <NeoHeader
        title="Dashboard"
        subtitle={activeDevice ? `${activeDevice.name} connected` : 'No device connected'}
      />

      {/* Main Ring */}
      <GlowCard style={styles.ringCard}>
        <View style={styles.ringRow}>
          <StatRing
            percent={avgPercent}
            size={180}
            strokeWidth={12}
            color={Colors.primary}
            label="Overall"
            value={`${avgPercent}%`}
            sublabel="Daily Goal"
          />
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={[Typography.monoLarge, { color: Colors.primary, fontSize: 22 }]}>
                {formatSteps(steps)}
              </Text>
              <Text style={[Typography.label, styles.miniLabel]}>Steps</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={[Typography.monoLarge, { color: Colors.green, fontSize: 22 }]}>
                {calories}
              </Text>
              <Text style={[Typography.label, styles.miniLabel]}>Cal</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={[Typography.monoLarge, { color: Colors.secondary, fontSize: 22 }]}>
                {km.toFixed(1)}
              </Text>
              <Text style={[Typography.label, styles.miniLabel]}>KM</Text>
            </View>
          </View>
        </View>

        <View style={styles.syncRow}>
          <SyncButton onPress={handleSync} isSyncing={isSyncing} />
        </View>
      </GlowCard>

      {/* Progress Bars */}
      <GlowCard glowColor={Colors.greenGlow}>
        <Text style={[Typography.label, styles.sectionLabel]}>Today's Goals</Text>
        <ProgressBar
          label="Steps"
          current={steps}
          goal={dailyGoal.steps}
          unit="steps"
          color={Colors.primary}
          formatValue={(v) => v.toLocaleString()}
        />
        <ProgressBar
          label="Calories"
          current={calories}
          goal={dailyGoal.calories}
          unit="kcal"
          color={Colors.orange}
        />
        <ProgressBar
          label="Distance"
          current={km}
          goal={dailyGoal.distanceKm}
          unit="km"
          color={Colors.green}
          formatValue={(v) => v.toFixed(2)}
        />
      </GlowCard>

      {/* Chart */}
      <GlowCard noPadding glowColor={Colors.secondaryGlow}>
        <View style={styles.chartHeader}>
          <Text style={[Typography.label, styles.sectionLabel]}>7-Day Steps</Text>
        </View>
        <LineChart
          data={{
            labels: chartData.map((d) => d.label),
            datasets: [{ data: chartData.map((d) => Math.max(d.steps, 0)) }],
          }}
          width={width - Spacing.base * 2 - 2}
          height={180}
          chartConfig={{
            backgroundGradientFrom: Colors.surfaceCard,
            backgroundGradientTo: Colors.surfaceCard,
            color: (opacity = 1) => `rgba(0, 245, 255, ${opacity})`,
            labelColor: () => Colors.textMuted,
            strokeWidth: 2,
            decimalPlaces: 0,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: Colors.primary,
              fill: Colors.background,
            },
          }}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
        />
      </GlowCard>

      {/* Calories Chart */}
      <GlowCard noPadding glowColor={Colors.orangeGlow}>
        <View style={styles.chartHeader}>
          <Text style={[Typography.label, styles.sectionLabel]}>7-Day Calories</Text>
        </View>
        <LineChart
          data={{
            labels: chartData.map((d) => d.label),
            datasets: [{ data: chartData.map((d) => Math.max(d.calories, 0)) }],
          }}
          width={width - Spacing.base * 2 - 2}
          height={160}
          chartConfig={{
            backgroundGradientFrom: Colors.surfaceCard,
            backgroundGradientTo: Colors.surfaceCard,
            color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
            labelColor: () => Colors.textMuted,
            strokeWidth: 2,
            decimalPlaces: 0,
            propsForDots: {
              r: '3',
              strokeWidth: '2',
              stroke: Colors.orange,
              fill: Colors.background,
            },
          }}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
        />
      </GlowCard>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  ringCard: {
    marginBottom: Spacing.md,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.base,
  },
  miniStats: {
    flex: 1,
    gap: Spacing.base,
  },
  miniStat: {
    alignItems: 'flex-start',
  },
  miniLabel: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  syncRow: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  chartHeader: {
    padding: Spacing.base,
    paddingBottom: 0,
  },
  chart: {
    borderRadius: Radii,
  },
  footer: {
    height: Spacing.xxl,
  },
});

const Radii = 12;
