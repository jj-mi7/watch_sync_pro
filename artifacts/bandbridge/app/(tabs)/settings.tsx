import * as Haptics from 'expo-haptics';
import { ChevronRight, Code, Info, PlusCircle, Smartphone, Target, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { NeoCard } from '@/components/ui/NeoCard';
import { useApp } from '@/context/AppContext';

const GOAL_PRESETS = [5000, 8000, 10000, 12000, 15000];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { dailyGoal, setDailyGoal, user, setUser, addManualSteps } = useApp();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [customGoal, setCustomGoal] = useState(dailyGoal.toString());
  const [profile, setProfile] = useState({ name: user?.name ?? '', weight: user?.weight?.toString() ?? '', height: user?.height?.toString() ?? '' });
  const [manualSteps, setManualSteps] = useState('');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const handleSaveGoal = async (goal: number) => {
    if (isNaN(goal) || goal <= 0) {
      Alert.alert('Invalid', 'Please enter a valid step goal.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setDailyGoal(goal);
    setShowGoalModal(false);
  };

  const handleSaveProfile = async () => {
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    if (!profile.name.trim() || isNaN(weight) || isNaN(height)) {
      Alert.alert('Invalid', 'Please fill all fields correctly.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setUser({ name: profile.name.trim(), weight, height });
    setShowProfileModal(false);
  };

  const handleManualSteps = async () => {
    const steps = parseInt(manualSteps);
    if (isNaN(steps) || steps <= 0) {
      Alert.alert('Invalid', 'Enter a valid step count.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await addManualSteps(steps);
    setManualSteps('');
    setShowManualModal(false);
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Profile</Text>
          <NeoCard>
            <SettingRow
              icon={<User size={18} color={Colors.accent} />}
              label="Personal Info"
              value={user?.name ?? 'Not set'}
              onPress={() => setShowProfileModal(true)}
            />
          </NeoCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Activity Goals</Text>
          <NeoCard>
            <SettingRow
              icon={<Target size={18} color={Colors.neon} />}
              label="Daily Step Goal"
              value={dailyGoal.toLocaleString() + ' steps'}
              onPress={() => setShowGoalModal(true)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<PlusCircle size={18} color={Colors.amber} />}
              label="Log Steps Manually"
              value="Add steps"
              onPress={() => setShowManualModal(true)}
            />
          </NeoCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>How to Connect</Text>
          <NeoCard accent="neon" style={styles.howToCard}>
            <Text style={styles.howToTitle}>Casio ABL-100WE Bluetooth Setup</Text>
            <HowToStep
              num="1"
              text="On your Casio ABL-100WE, enter pairing mode by holding the lower-left button until 'PAIRING' shows on display."
            />
            <HowToStep
              num="2"
              text="On Android, use NRF Connect app to find your watch and note the Service UUID and Characteristic UUIDs from the GATT services list."
            />
            <HowToStep
              num="3"
              text="Go to Devices tab → tap + → enter the UUIDs from step 2. Use the Casio template as a starting point."
            />
            <HowToStep
              num="4"
              text="Tap Connect on your watch card. If connection fails, verify your UUIDs match those in NRF Connect."
            />
            <View style={styles.nrfTip}>
              <Info size={13} color={Colors.neon} />
              <Text style={styles.nrfTipText}>NRF Connect is free on Google Play and App Store — essential for finding BLE UUIDs.</Text>
            </View>
          </NeoCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>App Info</Text>
          <NeoCard>
            <SettingRow
              icon={<Smartphone size={18} color={Colors.textMuted} />}
              label="BandBridge"
              value="v1.0.0"
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Code size={18} color={Colors.textMuted} />}
              label="Built with"
              value="Expo + BLE PLX"
            />
          </NeoCard>
        </Animated.View>
      </ScrollView>

      <GoalModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        customGoal={customGoal}
        setCustomGoal={setCustomGoal}
        currentGoal={dailyGoal}
        onSave={handleSaveGoal}
      />

      <Modal visible={showProfileModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowProfileModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Personal Info</Text>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={v => setProfile(p => ({ ...p, name: v }))}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.fieldLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={profile.weight}
              onChangeText={v => setProfile(p => ({ ...p, weight: v }))}
              placeholder="70"
              keyboardType="numeric"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.fieldLabel}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={profile.height}
              onChangeText={v => setProfile(p => ({ ...p, height: v }))}
              placeholder="170"
              keyboardType="numeric"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowProfileModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleSaveProfile}>
                <Text style={styles.confirmBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showManualModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowManualModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Steps Manually</Text>
            <Text style={styles.fieldLabel}>Step Count</Text>
            <TextInput
              style={styles.input}
              value={manualSteps}
              onChangeText={setManualSteps}
              placeholder="e.g. 1000"
              keyboardType="numeric"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowManualModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleManualSteps}>
                <Text style={styles.confirmBtnText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingRow({ icon, label, value, onPress }: { icon: React.ReactNode; label: string; value: string; onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, pressed && onPress && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
      {onPress && <ChevronRight size={16} color={Colors.textMuted} />}
    </Pressable>
  );
}

function HowToStep({ num, text }: { num: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{num}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function GoalModal({ visible, onClose, customGoal, setCustomGoal, currentGoal, onSave }: any) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Daily Step Goal</Text>
          <View style={styles.goalPresets}>
            {GOAL_PRESETS.map(g => (
              <Pressable
                key={g}
                style={[styles.goalPreset, currentGoal === g && { backgroundColor: Colors.neonDim, borderColor: Colors.neon }]}
                onPress={() => { setCustomGoal(g.toString()); onSave(g); }}
              >
                <Text style={[styles.goalPresetText, currentGoal === g && { color: Colors.neon }]}>
                  {g.toLocaleString()}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Custom Goal</Text>
          <TextInput
            style={styles.input}
            value={customGoal}
            onChangeText={setCustomGoal}
            placeholder="Enter steps"
            keyboardType="numeric"
            placeholderTextColor={Colors.textMuted}
          />
          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={() => onSave(parseInt(customGoal))}>
              <Text style={styles.confirmBtnText}>Set Goal</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 20 },
  header: { gap: 2 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 26, color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textSecondary },
  section: { gap: 8 },
  sectionLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  howToCard: { padding: 16, gap: 12 },
  howToTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.neon, letterSpacing: -0.2 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.neonDim, borderWidth: 1, borderColor: Colors.neonBorder, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Colors.neon },
  stepText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  nrfTip: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.neonDim, borderRadius: 8, padding: 10 },
  nrfTipText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.neon, lineHeight: 18 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  settingIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.textPrimary },
  settingValue: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 4 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: Colors.textPrimary },
  fieldLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, color: Colors.textPrimary, fontFamily: 'Inter_400Regular', fontSize: 14 },
  goalPresets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalPreset: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  goalPresetText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textSecondary },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.textSecondary },
  confirmBtn: { flex: 2, backgroundColor: Colors.neon, borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: Colors.neon, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8 },
  confirmBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.bg },
});
