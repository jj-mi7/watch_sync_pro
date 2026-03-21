import { GlassCard } from "@/components/cards/GlassCard";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { logout } from "@/redux/slices/authSlice";
import { clearDevice } from "@/redux/slices/deviceSlice";
import { clearHealth } from "@/redux/slices/healthSlice";
import {
  resetGoals,
  setAllGoalsFromSteps,
} from "@/redux/slices/settingsSlice";
import { setHeight, setWeight } from "@/redux/slices/userSlice";
import type { RootState } from "@/redux/store";
import React, { useState } from "react";
import { Alert, Text, View, Modal, TextInput, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@/components/common/Icon";

export const SettingsScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const userStats = useSelector((state: RootState) => state.user);
  const settings = useSelector((state: RootState) => state.settings);

  // Modal states for Height/Weight editing
  const [showHeightModal, setShowHeightModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [tempHeight, setTempHeight] = useState("");
  const [tempWeight, setTempWeight] = useState("");

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          dispatch(clearDevice());
          dispatch(clearHealth());
        },
      },
    ]);
  };

  const handleSaveHeight = () => {
    const val = parseFloat(tempHeight);
    if (!isNaN(val) && val > 50 && val < 250) {
      dispatch(setHeight(val));
      dispatch(
        setAllGoalsFromSteps({
          steps: settings.dailyStepGoal,
          heightCm: val,
          weightKg: userStats.weightKg || 70,
          isMale: userStats.gender !== "female",
        })
      );
    }
    setShowHeightModal(false);
  };

  const handleSaveWeight = () => {
    const val = parseFloat(tempWeight);
    if (!isNaN(val) && val > 20 && val < 300) {
      dispatch(setWeight(val));
      dispatch(
        setAllGoalsFromSteps({
          steps: settings.dailyStepGoal,
          heightCm: userStats.heightCm || 170,
          weightKg: val,
          isMale: userStats.gender !== "female",
        })
      );
    }
    setShowWeightModal(false);
  };

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </Animated.View>

      {/* Profile */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionLabel}>PROFILE</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{authUser?.displayName?.[0]?.toUpperCase() || "W"}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{authUser?.displayName || "Watch User"}</Text>
              <Text style={styles.profileEmail}>{authUser?.email || "user@example.com"}</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Biometrics */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionLabel}>BIOMETRICS</Text>
          <TouchableOpacity
            style={styles.goalRow}
            onPress={() => {
              setTempHeight(userStats?.heightCm?.toString() || "");
              setShowHeightModal(true);
            }}
          >
            <Text style={styles.goalLabel}>Height</Text>
            <Text style={[styles.goalValue, { color: theme.colors.textSecondary }]}>
              {userStats?.heightCm ? `${userStats.heightCm} cm` : "Not set"}
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} style={{marginLeft: 8}} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.goalRow}
            onPress={() => {
              setTempWeight(userStats?.weightKg?.toString() || "");
              setShowWeightModal(true);
            }}
          >
            <Text style={styles.goalLabel}>Weight</Text>
            <Text style={[styles.goalValue, { color: theme.colors.textSecondary }]}>
              {userStats?.weightKg ? `${userStats.weightKg} kg` : "Not set"}
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} style={{marginLeft: 8}} />
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>

      {/* Daily Goals */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionLabel}>DAILY GOALS</Text>
          <GoalRow
            label="Steps"
            value={settings.dailyStepGoal.toLocaleString()}
            color={theme.colors.chartCyan}
          />
          <GoalRow
            label="Calories"
            value={`${settings.dailyCalorieGoal} kcal`}
            color={theme.colors.chartPurple}
          />
          <GoalRow
            label="Distance"
            value={`${settings.dailyDistanceGoalKm} km`}
            color={theme.colors.chartGreen}
          />
          <NeoButton
            title="RESET TO DEFAULTS"
            onPress={() => dispatch(resetGoals())}
            variant="ghost"
            color={theme.colors.textTertiary}
            size="sm"
            style={{ marginTop: theme.spacing.md }}
          />
        </GlassCard>
      </Animated.View>

      {/* App Info */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionLabel}>APP</Text>
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Build" value="2026.03.21" />
          <InfoRow label="Storage" value="MMKV" />
          <InfoRow label="BLE Library" value="react-native-ble-plx" />
        </GlassCard>
      </Animated.View>

      {/* Logout */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <NeoButton
          title="LOG OUT"
          onPress={handleLogout}
          color={theme.colors.error}
          size="lg"
          style={{ marginBottom: theme.spacing.xxl }}
        />
      </Animated.View>

      {/* Height Modal */}
      <Modal visible={showHeightModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Height (cm)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={tempHeight}
              onChangeText={setTempHeight}
              placeholder="e.g. 175"
              placeholderTextColor={theme.colors.textTertiary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <NeoButton
                title="CANCEL"
                onPress={() => setShowHeightModal(false)}
                variant="ghost"
                color={theme.colors.textSecondary}
                style={{ flex: 1, marginRight: 8 }}
              />
              <NeoButton
                title="SAVE"
                onPress={handleSaveHeight}
                color={theme.colors.primary}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Weight Modal */}
      <Modal visible={showWeightModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Weight (kg)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={tempWeight}
              onChangeText={setTempWeight}
              placeholder="e.g. 70.5"
              placeholderTextColor={theme.colors.textTertiary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <NeoButton
                title="CANCEL"
                onPress={() => setShowWeightModal(false)}
                variant="ghost"
                color={theme.colors.textSecondary}
                style={{ flex: 1, marginRight: 8 }}
              />
              <NeoButton
                title="SAVE"
                onPress={handleSaveWeight}
                color={theme.colors.primary}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </GlassCard>
        </View>
      </Modal>

    </ScreenWrapper>
  );
};

const GoalRow: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={styles.goalRow}>
    <View style={styles.goalDot}>
      <View style={[styles.goalDotInner, { backgroundColor: color }]} />
    </View>
    <Text style={styles.goalLabel}>{label}</Text>
    <Text style={[styles.goalValue, { color }]}>{value}</Text>
  </View>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  // Profile
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
  },
  avatarText: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.primary,
  },
  profileName: {
    fontSize: theme.fontSize.body,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  profileEmail: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
  },
  // Goals
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  goalDot: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  goalDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  goalLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  goalValue: {
    fontSize: theme.fontSize.body,
    fontWeight: "700",
  },
  // Prefs
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prefLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
  },
  unitToggle: {
    flexDirection: "row",
    width: 140,
  },
  // Info
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  infoLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
  },
  infoValue: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  modalCard: {
    padding: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));
