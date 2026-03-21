import { GlassCard } from "@/components/cards/GlassCard";
import { WatchCard } from "@/components/cards/WatchCard";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { setAllGoalsFromSteps } from "@/redux/slices/settingsSlice";
import type { RootState } from "@/redux/store";
import { NotificationService } from "@/services/notifications/NotificationService";
import { calculateStepStats } from "@/utils/healthMath";
import { useNavigation } from "@react-navigation/native";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Icon } from "@/components/common/Icon";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch, useSelector } from "react-redux";

const getBmiCategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: "Underweight", color: "#FF9F0A" };
  if (bmi < 25) return { label: "Normal", color: "#32D74B" };
  if (bmi < 30) return { label: "Overweight", color: "#FF9F0A" };
  return { label: "Obese", color: "#FF453A" };
};

export const DashboardScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  // biome-ignore lint/suspicious/noExplicitAny: Root stack param list not fully enforced yet
  const navigation = useNavigation<any>();
  const { device, connectionStatus } = useSelector((state: RootState) => state.device);
  const { todaySteps, todayCalories, todayDistanceKm, todayActiveMinutes } = useSelector(
    (state: RootState) => state.health,
  );
  const { dailyStepGoal, dailyCalorieGoal, dailyDistanceGoalKm, dailyActiveGoal } = useSelector(
    (state: RootState) => state.settings,
  );
  const user = useSelector((state: RootState) => state.user);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyStepGoal);

  const stepProgress = useMemo(
    () => (dailyStepGoal > 0 ? todaySteps / dailyStepGoal : 0),
    [todaySteps, dailyStepGoal],
  );
  const calProgress = useMemo(
    () => (dailyCalorieGoal > 0 ? todayCalories / dailyCalorieGoal : 0),
    [todayCalories, dailyCalorieGoal],
  );
  const distProgress = useMemo(
    () => (dailyDistanceGoalKm > 0 ? todayDistanceKm / dailyDistanceGoalKm : 0),
    [todayDistanceKm, dailyDistanceGoalKm],
  );
  const activeProgress = useMemo(
    () => (dailyActiveGoal > 0 ? todayActiveMinutes / dailyActiveGoal : 0),
    [todayActiveMinutes, dailyActiveGoal],
  );

  useEffect(() => {
    NotificationService.requestPermissions();
  }, []);

  // Preview stats for the goal modal
  const previewStats = useMemo(() => {
    const h = user.heightCm || 170;
    const w = user.weightKg || 70;
    return calculateStepStats(tempGoal, h, w, user.gender !== "female");
  }, [tempGoal, user]);

  const handleSaveGoal = () => {
    dispatch(
      setAllGoalsFromSteps({
        steps: tempGoal,
        heightCm: user.heightCm || 170,
        weightKg: user.weightKg || 70,
        isMale: user.gender !== "female",
      }),
    );
    setShowGoalModal(false);
  };

  const goalPresets = [5000, 8000, 10000, 12000, 15000];

  return (
    <ScreenWrapper>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Good {getGreeting()}{authUser?.displayName ? `, ${authUser.displayName.split(' ')[0]}` : ""}
          </Text>
          <Text style={styles.title}>StrideSync</Text>
        </View>
        <TouchableOpacity
          style={styles.syncBadge}
          onPress={() => navigation.navigate("Device", { screen: "Sync" })}
        >
          <Icon name="refresh-cw" size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Watch Card */}
      <WatchCard
        watchName={device?.name || "CASIO ABL-100WE"}
        photoUri={device?.photoUri}
        connectionStatus={connectionStatus}
        batteryLevel={device?.batteryLevel ?? 85}
        lastSyncTime={device?.lastSyncTime}
        onPress={() => navigation.navigate("Device")}
        style={styles.watchCard}
      />

      {/* Progress Rings */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <GlassCard style={styles.ringsCard}>
          <Text style={styles.sectionLabel}>TODAY'S PROGRESS</Text>
          <View style={styles.ringsRow}>
            <TouchableOpacity style={styles.ringItem} onPress={() => navigation.navigate("Steps")}>
              <AnimatedRing progress={stepProgress} size={75} color={theme.colors.chartCyan}>
                <Text style={styles.ringValue}>{formatNumber(todaySteps)}</Text>
                <Text style={styles.ringUnit}>steps</Text>
              </AnimatedRing>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ringItem}
              onPress={() => navigation.navigate("Steps", { screen: "Calories" })}
            >
              <AnimatedRing progress={calProgress} size={75} color={theme.colors.chartPurple}>
                <Text style={styles.ringValue}>{todayCalories}</Text>
                <Text style={styles.ringUnit}>cal</Text>
              </AnimatedRing>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ringItem}
              onPress={() => navigation.navigate("Steps", { screen: "Distance" })}
            >
              <AnimatedRing progress={distProgress} size={75} color={theme.colors.chartGreen}>
                <Text style={styles.ringValue}>{todayDistanceKm}</Text>
                <Text style={styles.ringUnit}>km</Text>
              </AnimatedRing>
            </TouchableOpacity>


          </View>
        </GlassCard>
      </Animated.View>

      {/* Step Goal Card — Tappable */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setTempGoal(dailyStepGoal);
            setShowGoalModal(true);
          }}
        >
          <GlassCard style={styles.goalCard}>
            <View style={styles.goalCardRow}>
              <View>
                <Text style={styles.goalLabel}>DAILY TARGET</Text>
                <Text style={styles.goalValue}>{dailyStepGoal.toLocaleString()} steps</Text>
              </View>
              <Icon name="edit-2" size={16} color={theme.colors.textTertiary} />
            </View>
            <View style={styles.goalStatsRow}>
              <GoalStat label="Calories" value={`${dailyCalorieGoal} cal`} />
              <GoalStat label="Distance" value={`${dailyDistanceGoalKm} km`} />
              <GoalStat label="Active" value={`${dailyActiveGoal} min`} />
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>

      {/* BMI Card */}
      <Animated.View entering={FadeInDown.delay(500).duration(500)}>
        <BmiCard heightCm={user.heightCm} weightKg={user.weightKg} />
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(600).duration(500)}>
        <GlassCard style={styles.actionsCard}>
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <View style={styles.actionsRow}>
            <QuickAction
              iconName="smartphone"
              label="Find Phone"
              onPress={() => navigation.navigate("Device", { screen: "FindPhone" })}
            />
            <QuickAction
              iconName="camera"
              label="Watch Photo"
              onPress={() => navigation.navigate("Device", { screen: "WatchProfile" })}
            />
            <QuickAction
              iconName="settings"
              label="Settings"
              onPress={() => navigation.navigate("Settings")}
            />
            <QuickAction
              iconName="bar-chart-2"
              label="History"
              onPress={() => navigation.navigate("Steps")}
            />
          </View>
        </GlassCard>
      </Animated.View>

      {/* Goal Editor Modal */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Daily Step Goal</Text>
            <View style={styles.goalPresets}>
              {goalPresets.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetBtn,
                    tempGoal === preset && {
                      backgroundColor: `${theme.colors.primary}20`,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => setTempGoal(preset)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      tempGoal === preset && { color: theme.colors.primary },
                    ]}
                  >
                    {(preset / 1000).toFixed(0)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Auto-computed preview */}
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>AUTO-CALCULATED GOALS</Text>
              <View style={styles.previewRow}>
                <PreviewItem label="Calories" value={`${previewStats.caloriesBurned}`} unit="cal" />
                <PreviewItem label="Distance" value={`${previewStats.distanceKm}`} unit="km" />
                <PreviewItem label="Weight" value={`${previewStats.weightLostKg}`} unit="kg lost" />
              </View>
            </View>

            <NeoButton
              title="SAVE"
              onPress={handleSaveGoal}
              color={theme.colors.primary}
              size="md"
              style={{ marginTop: theme.spacing.sm }}
            />
            <NeoButton
              title="CANCEL"
              onPress={() => setShowGoalModal(false)}
              variant="ghost"
              color={theme.colors.textTertiary}
              size="sm"
              style={{ marginTop: theme.spacing.sm }}
            />
          </GlassCard>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const GoalStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={goalStatStyles.container}>
    <Text style={goalStatStyles.value}>{value}</Text>
    <Text style={goalStatStyles.label}>{label}</Text>
  </View>
);

const goalStatStyles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    flex: 1,
  },
  value: {
    fontSize: theme.fontSize.caption,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
}));

const PreviewItem: React.FC<{ label: string; value: string; unit: string }> = ({
  label,
  value,
  unit,
}) => (
  <View style={previewStyles.item}>
    <Text style={previewStyles.value}>{value}</Text>
    <Text style={previewStyles.unit}>{unit}</Text>
    <Text style={previewStyles.label}>{label}</Text>
  </View>
);

const previewStyles = StyleSheet.create((theme) => ({
  item: {
    alignItems: "center",
    flex: 1,
  },
  value: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  unit: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
}));

const QuickAction: React.FC<{ iconName: string; label: string; onPress: () => void }> = ({
  iconName,
  label,
  onPress,
}) => {
  const { theme } = useUnistyles();
  return (
    <TouchableOpacity style={qaStyles.action} onPress={onPress} activeOpacity={0.7}>
      <View style={qaStyles.iconWrap}>
        <Icon name={iconName} size={18} color={theme.colors.textSecondary} />
      </View>
      <Text style={qaStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

// ── BMI Card ──────────────────────────────────────────────────────────────────
const BmiCard: React.FC<{ heightCm: number | null; weightKg: number | null }> = ({
  heightCm,
  weightKg,
}) => {
  const { theme } = useUnistyles();

  if (!heightCm || !weightKg) {
    return (
      <GlassCard style={bmiStyles.card}>
        <Text style={bmiStyles.label}>BMI</Text>
        <Text style={bmiStyles.hint}>
          Set your height and weight in Settings to see your BMI.
        </Text>
      </GlassCard>
    );
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const category = getBmiCategory(bmi);

  // Target weight for normal BMI (18.5–24.9)
  const normalMaxWeight = 24.9 * heightM * heightM;
  const normalMinWeight = 18.5 * heightM * heightM;
  let targetMsg = "";
  if (bmi >= 25) {
    const toLose = weightKg - normalMaxWeight;
    targetMsg = `Lose ${toLose.toFixed(1)} kg to reach normal`;
  } else if (bmi < 18.5) {
    const toGain = normalMinWeight - weightKg;
    targetMsg = `Gain ${toGain.toFixed(1)} kg to reach normal`;
  }

  return (
    <GlassCard style={bmiStyles.card}>
      <View style={bmiStyles.row}>
        <View>
          <Text style={bmiStyles.label}>BODY MASS INDEX</Text>
          <View style={bmiStyles.valueRow}>
            <Text style={[bmiStyles.value, { color: category.color }]}>{bmi.toFixed(1)}</Text>
            <View style={[bmiStyles.badge, { backgroundColor: `${category.color}20` }]}>
              <Text style={[bmiStyles.badgeText, { color: category.color }]}>
                {category.label}
              </Text>
            </View>
          </View>
        </View>
        <Icon name="heart" size={20} color={category.color} />
      </View>
      {targetMsg ? (
        <Text style={bmiStyles.target}>{targetMsg}</Text>
      ) : (
        <Text style={[bmiStyles.target, { color: theme.colors.success }]}>
          You're in a healthy range!
        </Text>
      )}
      {/* BMI Scale Bar */}
      <View style={bmiStyles.scaleBar}>
        <View style={[bmiStyles.scaleSegment, { flex: 18.5, backgroundColor: "#FF9F0A30" }]} />
        <View style={[bmiStyles.scaleSegment, { flex: 6.5, backgroundColor: "#32D74B30" }]} />
        <View style={[bmiStyles.scaleSegment, { flex: 5, backgroundColor: "#FF9F0A30" }]} />
        <View style={[bmiStyles.scaleSegment, { flex: 10, backgroundColor: "#FF453A30" }]} />
      </View>
      <View style={bmiStyles.scaleLabels}>
        <Text style={bmiStyles.scaleText}>18.5</Text>
        <Text style={bmiStyles.scaleText}>25</Text>
        <Text style={bmiStyles.scaleText}>30</Text>
      </View>
    </GlassCard>
  );
};

const qaStyles = StyleSheet.create((theme) => ({
  action: {
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
}));

const bmiStyles = StyleSheet.create((theme) => ({
  card: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  hint: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  value: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  target: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.md,
  },
  scaleBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  scaleSegment: {
    height: "100%",
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "20%",
  },
  scaleText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
}));

// Helpers
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  syncBadge: {
    backgroundColor: theme.colors.primaryGlow,
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },
  watchCard: {
    marginBottom: theme.spacing.lg,
  },
  ringsCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  ringItem: {
    alignItems: "center",
    flex: 1,
  },
  ringValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  ringUnit: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textTertiary,
    marginTop: -2,
  },
  // Goal card
  goalCard: {
    marginBottom: theme.spacing.lg,
  },
  goalCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  goalLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  goalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  goalStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
    paddingTop: theme.spacing.md,
  },
  actionsCard: {
    marginBottom: theme.spacing.lg,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxl,
  },
  modalCard: {},
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  goalPresets: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  presetBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surfaceLight,
  },
  presetText: {
    fontSize: theme.fontSize.caption,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  previewCard: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  previewTitle: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
}));
