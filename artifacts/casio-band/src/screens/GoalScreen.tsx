import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, TextInput, Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { X, Target, Zap, Map, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { F } from '@/constants/fonts';
import { useFitness } from '@/context/FitnessContext';

const C = Colors.dark;

const STEP_PRESETS = [5000, 8000, 10000, 12000, 15000];
const CAL_PRESETS = [300, 500, 700, 1000];
const KM_PRESETS = [3, 5, 8, 10];

function PresetRow({ label, presets, current, onSelect }: {
  label: string; presets: number[]; current: number; onSelect: (v: number) => void;
}) {
  return (
    <View style={styles.presetRow}>
      <Text style={styles.presetLabel}>{label}</Text>
      <View style={styles.presetBtns}>
        {presets.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.presetBtn, current === p && styles.presetBtnActive]}
            onPress={() => { Vibration.vibrate(30); onSelect(p); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.presetBtnText, current === p && styles.presetBtnTextActive]}>
              {p.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function GoalScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { dailyGoal, setDailyGoal } = useFitness();
  const [steps, setSteps] = useState(dailyGoal.steps);
  const [calories, setCalories] = useState(dailyGoal.calories);
  const [distanceKm, setDistanceKm] = useState(dailyGoal.distanceKm);
  const [saved, setSaved] = useState(false);
  const topPad = Platform.OS === 'web' ? 60 : insets.top + 8;

  const handleSave = useCallback(async () => {
    await setDailyGoal({ steps, calories, distanceKm });
    Vibration.vibrate([0, 100, 50, 100]);
    setSaved(true);
    setTimeout(() => navigation.goBack(), 1000);
  }, [steps, calories, distanceKm, setDailyGoal, navigation]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={20} color={C.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Daily Goal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: `${C.accent}22` }]}>
              <Zap size={18} color={C.accent} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>Steps Goal</Text>
            <Text style={[styles.currentValue, { color: C.accent }]}>{steps.toLocaleString()}</Text>
          </View>
          <PresetRow label="Quick presets" presets={STEP_PRESETS} current={steps} onSelect={setSteps} />
          <TextInput
            style={styles.input}
            value={steps.toString()}
            onChangeText={v => { const n = parseInt(v); if (!isNaN(n) && n > 0) setSteps(n); }}
            keyboardType="numeric"
            placeholder="Custom value"
            placeholderTextColor={C.textMuted}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: `${C.warning}22` }]}>
              <Target size={18} color={C.warning} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>Calories Goal</Text>
            <Text style={[styles.currentValue, { color: C.warning }]}>{Math.round(calories)} kcal</Text>
          </View>
          <PresetRow label="Quick presets" presets={CAL_PRESETS} current={calories} onSelect={setCalories} />
          <TextInput
            style={styles.input}
            value={calories.toString()}
            onChangeText={v => { const n = parseInt(v); if (!isNaN(n) && n > 0) setCalories(n); }}
            keyboardType="numeric"
            placeholder="Custom value"
            placeholderTextColor={C.textMuted}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: `${C.accentTeal}22` }]}>
              <Map size={18} color={C.accentTeal} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>Distance Goal</Text>
            <Text style={[styles.currentValue, { color: C.accentTeal }]}>{distanceKm.toFixed(1)} km</Text>
          </View>
          <PresetRow label="Quick presets" presets={KM_PRESETS} current={distanceKm} onSelect={setDistanceKm} />
          <TextInput
            style={styles.input}
            value={distanceKm.toString()}
            onChangeText={v => { const n = parseFloat(v); if (!isNaN(n) && n > 0) setDistanceKm(n); }}
            keyboardType="numeric"
            placeholder="Custom value"
            placeholderTextColor={C.textMuted}
          />
        </Animated.View>

        <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={handleSave} activeOpacity={0.85}>
          {saved ? (
            <>
              <CheckCircle size={20} color={C.background} strokeWidth={2.5} />
              <Text style={styles.saveBtnText}>Saved!</Text>
            </>
          ) : (
            <Text style={styles.saveBtnText}>Save Goal</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  title: { color: C.text, ...F.bold, fontSize: 18 },
  card: { backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { flex: 1, color: C.text, ...F.semibold, fontSize: 15 },
  currentValue: { ...F.bold, fontSize: 16 },
  presetRow: { gap: 8 },
  presetLabel: { color: C.textMuted, ...F.regular, fontSize: 12 },
  presetBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: C.backgroundElevated, borderWidth: 1, borderColor: C.border },
  presetBtnActive: { backgroundColor: `${C.accent}22`, borderColor: C.accent },
  presetBtnText: { color: C.textSecondary, ...F.medium, fontSize: 13 },
  presetBtnTextActive: { color: C.accent },
  input: { backgroundColor: C.backgroundElevated, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: C.text, ...F.medium, fontSize: 15, borderWidth: 1, borderColor: C.border },
  saveBtn: { backgroundColor: C.accent, borderRadius: 16, paddingVertical: 17, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  saveBtnDone: { backgroundColor: C.accentGreen },
  saveBtnText: { color: C.background, ...F.bold, fontSize: 16 },
});
