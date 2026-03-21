import { GlassCard } from "@/components/cards/GlassCard";
import { HealthChart } from "@/components/charts/HealthChart";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { Input } from "@/components/common/Input";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { setTodaySteps } from "@/redux/slices/healthSlice";
import { setWeight } from "@/redux/slices/userSlice";
import type { RootState } from "@/redux/store";
import type React from "react";
import { useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch, useSelector } from "react-redux";

const DAYS_LABEL_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const CaloriesScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  const { todayCalories, todaySteps, history } = useSelector((state: RootState) => state.health);
  const { dailyCalorieGoal } = useSelector((state: RootState) => state.settings);
  const user = useSelector((state: RootState) => state.user);
  const [chartRange, setChartRange] = useState<"week" | "month">("week");
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempWeight, setTempWeight] = useState(String(user.weightKg || 70));

  const progress = dailyCalorieGoal > 0 ? todayCalories / dailyCalorieGoal : 0;

  const chartData = useMemo(() => {
    const count = chartRange === "week" ? 7 : 30;
    if (history.length === 0) {
      return Array.from({ length: count }, () => 0);
    }
    return history.slice(-count).map((r) => r.calories);
  }, [history, chartRange]);

  const chartLabels = useMemo(() => {
    if (chartRange === "week") return DAYS_LABEL_7;
    return Array.from({ length: 30 }, (_, i) => (i % 5 === 0 ? `${i + 1}` : ""));
  }, [chartRange]);

  const currentWeight = user.weightKg || 70;
  const met = 3.5;
  const calPerMin = ((met * 3.5 * currentWeight) / 200).toFixed(2);

  const handleSaveWeight = () => {
    const w = Number.parseFloat(tempWeight);
    if (w > 0 && w < 500) {
      dispatch(setWeight(w));
      // Recalculate today's calories with new weight
      if (todaySteps > 0) {
        dispatch(
          setTodaySteps({
            steps: todaySteps,
            heightCm: user.heightCm,
            weightKg: w,
            gender: user.gender,
          }),
        );
      }
      setShowEditModal(false);
    }
  };

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Calories</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroSection}>
        <AnimatedRing
          progress={progress}
          size={180}
          strokeWidth={12}
          color={theme.colors.chartPurple}
        >
          <Text style={styles.heroValue}>{todayCalories}</Text>
          <Text style={styles.heroLabel}>KCAL BURNED</Text>
          <Text style={styles.heroGoal}>
            {Math.round(progress * 100)}% of {dailyCalorieGoal}
          </Text>
        </AnimatedRing>
      </Animated.View>

      <HealthChart
        data={chartData}
        labels={chartLabels}
        color={theme.colors.chartPurple}
        title="CALORIE HISTORY"
        unit="cal"
        activeRange={chartRange}
        onRangeChange={setChartRange}
      />

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.sectionLabel}>HOW CALORIES ARE CALCULATED</Text>
            <TouchableOpacity
              onPress={() => {
                setTempWeight(String(user.weightKg || 70));
                setShowEditModal(true);
              }}
            >
              <Text style={styles.editBtn}>EDIT</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.infoText}>
            Calories are estimated using the MET (Metabolic Equivalent of Task) formula for walking
            activity.
          </Text>
          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Formula</Text>
            <Text style={styles.formulaText}>
              Cal/min = (MET × 3.5 × Weight) / 200
            </Text>
            <Text style={styles.formulaText}>
              Total = Cal/min × (Steps / 100)
            </Text>
          </View>
          <View style={styles.paramRow}>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>MET Value</Text>
              <Text style={styles.paramValue}>3.5</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Your Weight</Text>
              <Text style={[styles.paramValue, { color: theme.colors.chartPurple }]}>
                {currentWeight} kg
              </Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Cal/min</Text>
              <Text style={styles.paramValue}>{calPerMin}</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Weight</Text>
            <Text style={styles.modalDesc}>
              Your weight is used to calculate calorie burn. A more accurate weight gives better
              estimates.
            </Text>
            <Input
              label="WEIGHT (KG)"
              value={tempWeight}
              onChangeText={setTempWeight}
              keyboardType="numeric"
              placeholder="70"
            />
            <NeoButton
              title="SAVE"
              onPress={handleSaveWeight}
              color={theme.colors.chartPurple}
              size="md"
              style={{ marginTop: theme.spacing.sm }}
            />
            <NeoButton
              title="CANCEL"
              onPress={() => setShowEditModal(false)}
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

const styles = StyleSheet.create((theme) => ({
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: theme.spacing.xxl,
  },
  heroValue: {
    fontSize: theme.fontSize.hero,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  heroLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: -2,
  },
  heroGoal: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.chartPurple,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  infoCard: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  editBtn: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
    color: theme.colors.chartPurple,
  },
  infoText: {
    fontSize: theme.fontSize.body,
    fontWeight: "400",
    color: theme.colors.textTertiary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  formulaCard: {
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  formulaTitle: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  formulaText: {
    fontFamily: "SpaceMono",
    color: theme.colors.chartPurple,
    fontSize: 12,
    marginBottom: 2,
  },
  paramRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paramItem: {
    alignItems: "center",
    flex: 1,
  },
  paramLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textTertiary,
    marginBottom: 4,
  },
  paramValue: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textPrimary,
    fontWeight: "700",
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
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  modalDesc: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
}));
