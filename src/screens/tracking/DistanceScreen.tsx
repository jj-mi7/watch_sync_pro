import { GlassCard } from "@/components/cards/GlassCard";
import { HealthChart } from "@/components/charts/HealthChart";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { Input } from "@/components/common/Input";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { setTodaySteps } from "@/redux/slices/healthSlice";
import { setGender, setHeight } from "@/redux/slices/userSlice";
import type { Gender } from "@/redux/slices/userSlice";
import { calculateStrideLength } from "@/utils/healthMath";
import type { RootState } from "@/redux/store";
import type React from "react";
import { useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch, useSelector } from "react-redux";

const DAYS_LABEL_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DistanceScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  const { todayDistanceKm, todaySteps, history } = useSelector(
    (state: RootState) => state.health,
  );
  const { dailyDistanceGoalKm } = useSelector((state: RootState) => state.settings);
  const user = useSelector((state: RootState) => state.user);
  const [chartRange, setChartRange] = useState<"week" | "month">("week");
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempHeight, setTempHeight] = useState(String(user.heightCm || 170));
  const [tempGender, setTempGender] = useState<Gender>(user.gender || "male");

  const displayDistance = todayDistanceKm;
  const displayGoal = dailyDistanceGoalKm;
  const unitLabel = "km";

  const progress = dailyDistanceGoalKm > 0 ? todayDistanceKm / dailyDistanceGoalKm : 0;

  const chartData = useMemo(() => {
    const count = chartRange === "week" ? 7 : 30;
    if (history.length === 0) {
      return Array.from({ length: count }, () => 0);
    }
    return history
      .slice(-count)
      .map((r) => r.distanceKm);
  }, [history, chartRange]);

  const chartLabels = useMemo(() => {
    if (chartRange === "week") return DAYS_LABEL_7;
    return Array.from({ length: 30 }, (_, i) => (i % 5 === 0 ? `${i + 1}` : ""));
  }, [chartRange]);

  const currentHeight = user.heightCm || 170;
  const currentGender = user.gender || "male";
  const strideLength = calculateStrideLength(currentHeight, currentGender);
  const strideCm = Math.round(strideLength * 100);
  const multiplier = currentGender === "female" ? "0.413" : "0.415";

  const handleSave = () => {
    const h = Number.parseFloat(tempHeight);
    if (h > 0 && h < 300) {
      dispatch(setHeight(h));
      if (tempGender) dispatch(setGender(tempGender));
      // Recalculate today's distance with new params
      if (todaySteps > 0) {
        dispatch(
          setTodaySteps({
            steps: todaySteps,
            heightCm: h,
            weightKg: user.weightKg,
            gender: tempGender,
          }),
        );
      }
      setShowEditModal(false);
    }
  };

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Distance</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroSection}>
        <AnimatedRing
          progress={progress}
          size={180}
          strokeWidth={12}
          color={theme.colors.chartGreen}
        >
          <Text style={styles.heroValue}>{displayDistance.toFixed(1)}</Text>
          <Text style={styles.heroLabel}>{unitLabel.toUpperCase()} WALKED</Text>
          <Text style={styles.heroGoal}>
            {Math.round(progress * 100)}% of {displayGoal.toFixed(1)} {unitLabel}
          </Text>
        </AnimatedRing>
      </Animated.View>

      <HealthChart
        data={chartData}
        labels={chartLabels}
        color={theme.colors.chartGreen}
        title="DISTANCE HISTORY"
        unit={unitLabel}
        activeRange={chartRange}
        onRangeChange={setChartRange}
      />

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.sectionLabel}>HOW DISTANCE IS CALCULATED</Text>
            <TouchableOpacity
              onPress={() => {
                setTempHeight(String(user.heightCm || 170));
                setTempGender(user.gender || "male");
                setShowEditModal(true);
              }}
            >
              <Text style={styles.editBtn}>EDIT</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.infoText}>
            Distance is estimated from your step count using a stride length derived from your
            height and gender.
          </Text>
          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Formula</Text>
            <Text style={styles.formulaText}>
              Stride = Height × {multiplier}
            </Text>
            <Text style={styles.formulaText}>
              Distance = Steps × Stride Length
            </Text>
          </View>
          <View style={styles.paramRow}>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Height</Text>
              <Text style={[styles.paramValue, { color: theme.colors.chartGreen }]}>
                {currentHeight} cm
              </Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Stride</Text>
              <Text style={styles.paramValue}>{strideCm} cm</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Gender</Text>
              <Text style={styles.paramValue}>
                {currentGender ? currentGender.charAt(0).toUpperCase() + currentGender.slice(1) : "—"}
              </Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Parameters</Text>
            <Text style={styles.modalDesc}>
              Adjust your height and gender for more accurate stride length and distance calculations.
            </Text>
            <Input
              label="HEIGHT (CM)"
              value={tempHeight}
              onChangeText={setTempHeight}
              keyboardType="numeric"
              placeholder="170"
            />
            <Text style={styles.genderLabel}>GENDER</Text>
            <View style={styles.genderRow}>
              {(["male", "female", "other"] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderBtn,
                    tempGender === g && {
                      backgroundColor: `${theme.colors.chartGreen}20`,
                      borderColor: theme.colors.chartGreen,
                    },
                  ]}
                  onPress={() => setTempGender(g)}
                >
                  <Text
                    style={[
                      styles.genderBtnText,
                      tempGender === g && { color: theme.colors.chartGreen },
                    ]}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <NeoButton
              title="SAVE"
              onPress={handleSave}
              color={theme.colors.chartGreen}
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
    color: theme.colors.chartGreen,
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
    color: theme.colors.chartGreen,
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
    color: theme.colors.chartGreen,
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
  genderLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  genderRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: "center",
  },
  genderBtnText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    fontWeight: "700",
  },
}));
