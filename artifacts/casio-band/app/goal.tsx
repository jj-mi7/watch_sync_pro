import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { X, Target, Plus, Minus, CheckCircle, Zap, Thermometer, Map } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useFitness } from "@/context/FitnessContext";

const C = Colors.dark;
const F = { regular: "SpaceGrotesk_400Regular", medium: "SpaceGrotesk_500Medium", semibold: "SpaceGrotesk_600SemiBold", bold: "SpaceGrotesk_700Bold" };

const PRESETS = [
  { label: "Beginner", steps: 5000, calories: 300, distanceKm: 3, color: C.accentTeal },
  { label: "Active", steps: 8000, calories: 500, distanceKm: 5, color: C.accent },
  { label: "Athlete", steps: 12000, calories: 700, distanceKm: 8, color: C.accentGreen },
  { label: "Elite", steps: 15000, calories: 900, distanceKm: 12, color: C.warning },
];

function NumberInput({ Icon, label, value, unit, onChange, step, color }: { Icon: any; label: string; value: number; unit: string; onChange: (v: number) => void; step: number; color: string }) {
  return (
    <View style={styles.inputCard}>
      <View style={styles.inputLabelRow}>
        <View style={[styles.inputIcon, { backgroundColor: `${color}22` }]}>
          <Icon size={16} color={color} strokeWidth={2} />
        </View>
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <View style={styles.inputRow}>
        <TouchableOpacity style={[styles.stepBtn, { borderColor: color }]} onPress={() => { onChange(Math.max(step, value - step)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
          <Minus size={18} color={color} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.inputCenter}>
          <Text style={[styles.inputValue, { color }]}>{typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString()}</Text>
          <Text style={styles.inputUnit}>{unit}</Text>
        </View>
        <TouchableOpacity style={[styles.stepBtn, { borderColor: color }]} onPress={() => { onChange(value + step); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
          <Plus size={18} color={color} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function GoalScreen() {
  const insets = useSafeAreaInsets();
  const { dailyGoal, setDailyGoal } = useFitness();
  const [steps, setSteps] = useState(dailyGoal.steps);
  const [calories, setCalories] = useState(dailyGoal.calories);
  const [distanceKm, setDistanceKm] = useState(dailyGoal.distanceKm);
  const [saved, setSaved] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSave = async () => {
    await setDailyGoal({ steps, calories, distanceKm });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setTimeout(() => { setSaved(false); router.back(); }, 1200);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={C.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Daily Goals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify()}>
          <Text style={styles.sectionTitle}>Quick Presets</Text>
          <View style={styles.presetsGrid}>
            {PRESETS.map(preset => (
              <TouchableOpacity key={preset.label} style={[styles.presetCard, { borderColor: `${preset.color}55` }]}
                onPress={() => { setSteps(preset.steps); setCalories(preset.calories); setDistanceKm(preset.distanceKm); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Text style={[styles.presetLabel, { color: preset.color }]}>{preset.label}</Text>
                <Text style={styles.presetSteps}>{preset.steps.toLocaleString()}</Text>
                <Text style={styles.presetUnit}>steps/day</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Text style={styles.sectionTitle}>Custom Goals</Text>
          <NumberInput Icon={Zap} label="Steps" value={steps} unit="steps/day" onChange={setSteps} step={500} color={C.accent} />
          <NumberInput Icon={Thermometer} label="Calories" value={Math.round(calories)} unit="kcal/day" onChange={setCalories} step={50} color={C.warning} />
          <NumberInput Icon={Map} label="Distance" value={parseFloat(distanceKm.toFixed(1))} unit="km/day" onChange={setDistanceKm} step={0.5} color={C.accentTeal} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.previewCard}>
          <Text style={styles.previewTitle}>Weekly Target</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewItem}>
              <Text style={[styles.previewValue, { color: C.accent }]}>{(steps * 7).toLocaleString()}</Text>
              <Text style={styles.previewLabel}>steps/week</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={[styles.previewValue, { color: C.warning }]}>{Math.round(calories * 7).toLocaleString()}</Text>
              <Text style={styles.previewLabel}>kcal/week</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={[styles.previewValue, { color: C.accentTeal }]}>{(distanceKm * 7).toFixed(0)}</Text>
              <Text style={styles.previewLabel}>km/week</Text>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity style={[styles.saveBtn, saved && { backgroundColor: C.accentGreen }]} onPress={handleSave}>
          <CheckCircle size={20} color={C.background} strokeWidth={2.5} />
          <Text style={styles.saveBtnText}>{saved ? "Goals Saved!" : "Save Goals"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  title: { color: C.text, fontFamily: F.bold, fontSize: 18 },
  sectionTitle: { color: C.textSecondary, fontFamily: F.semibold, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12, marginTop: 4 },
  presetsGrid: { flexDirection: "row", gap: 8, marginBottom: 24 },
  presetCard: { flex: 1, backgroundColor: C.backgroundCard, borderRadius: 14, padding: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  presetLabel: { fontFamily: F.semibold, fontSize: 12 },
  presetSteps: { color: C.text, fontFamily: F.bold, fontSize: 16 },
  presetUnit: { color: C.textMuted, fontFamily: F.regular, fontSize: 10 },
  inputCard: { backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  inputLabelRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  inputIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  inputLabel: { color: C.textSecondary, fontFamily: F.medium, fontSize: 14 },
  inputRow: { flexDirection: "row", alignItems: "center" },
  stepBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  inputCenter: { flex: 1, alignItems: "center" },
  inputValue: { fontFamily: F.bold, fontSize: 32 },
  inputUnit: { color: C.textMuted, fontFamily: F.regular, fontSize: 13 },
  previewCard: { backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.borderGlow, marginBottom: 20 },
  previewTitle: { color: C.textSecondary, fontFamily: F.medium, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  previewRow: { flexDirection: "row" },
  previewItem: { flex: 1, alignItems: "center", gap: 4 },
  previewValue: { fontFamily: F.bold, fontSize: 22 },
  previewLabel: { color: C.textMuted, fontFamily: F.regular, fontSize: 11 },
  saveBtn: { backgroundColor: C.accent, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  saveBtnText: { color: C.background, fontFamily: F.bold, fontSize: 16 },
});
