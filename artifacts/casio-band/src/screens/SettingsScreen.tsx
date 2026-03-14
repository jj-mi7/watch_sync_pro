import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, Switch, Alert, Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  X, Bluetooth, Settings, Bell, ChevronDown, ChevronUp,
  CheckCircle, Info, Zap, Radio, Watch, Save,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { F } from '@/constants/fonts';
import { useFitness } from '@/context/FitnessContext';

const C = Colors.dark;
const REMINDER_KEY = '@casio_step_reminder';

function SectionHeader({ Icon, title, color = C.textSecondary }: { Icon: any; title: string; color?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Icon size={16} color={color} strokeWidth={2} />
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
  );
}

function Collapsible({ title, Icon, defaultOpen = false, children, accentColor = C.accent }: {
  title: string; Icon: any; defaultOpen?: boolean; children: React.ReactNode; accentColor?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.collapsible}>
      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setOpen(o => !o)} activeOpacity={0.8}>
        <View style={[styles.collapsibleIcon, { backgroundColor: `${accentColor}22` }]}>
          <Icon size={16} color={accentColor} strokeWidth={2} />
        </View>
        <Text style={styles.collapsibleTitle}>{title}</Text>
        {open ? <ChevronUp size={18} color={C.textMuted} /> : <ChevronDown size={18} color={C.textMuted} />}
      </TouchableOpacity>
      {open && <View style={styles.collapsibleBody}>{children}</View>}
    </View>
  );
}

function LabeledInput({ label, value, onChangeText, placeholder }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    watchName, setWatchName,
    customServiceUUID, setCustomServiceUUID,
    customStepCharUUID, setCustomStepCharUUID,
    customCalCharUUID, setCustomCalCharUUID,
    customDistCharUUID, setCustomDistCharUUID,
  } = useFitness();

  const [localName, setLocalName] = useState(watchName);
  const [localServiceUUID, setLocalServiceUUID] = useState(customServiceUUID ?? '');
  const [localStepUUID, setLocalStepUUID] = useState(customStepCharUUID ?? '');
  const [localCalUUID, setLocalCalUUID] = useState(customCalCharUUID ?? '');
  const [localDistUUID, setLocalDistUUID] = useState(customDistCharUUID ?? '');
  const [saved, setSaved] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const topPad = Platform.OS === 'web' ? 60 : insets.top + 8;

  useEffect(() => {
    AsyncStorage.getItem(REMINDER_KEY).then(raw => {
      if (raw) {
        const d = JSON.parse(raw);
        setReminderEnabled(d.enabled ?? false);
      }
    });
  }, []);

  const handleReminderToggle = async (val: boolean) => {
    setReminderEnabled(val);
    await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify({ enabled: val }));
    if (val) Vibration.vibrate(30);
  };

  const handleSave = useCallback(async () => {
    await setWatchName(localName.trim() || 'Casio ABL-100WE');
    await setCustomServiceUUID(localServiceUUID.trim() || null);
    await setCustomStepCharUUID(localStepUUID.trim() || null);
    await setCustomCalCharUUID(localCalUUID.trim() || null);
    await setCustomDistCharUUID(localDistUUID.trim() || null);
    Vibration.vibrate([0, 80, 40, 80]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [localName, localServiceUUID, localStepUUID, localCalUUID, localDistUUID,
    setWatchName, setCustomServiceUUID, setCustomStepCharUUID, setCustomCalCharUUID, setCustomDistCharUUID]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={20} color={C.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, saved && styles.saveBtnDone]}>
          {saved ? <CheckCircle size={18} color={C.background} strokeWidth={2.5} /> : <Save size={18} color={C.background} strokeWidth={2.5} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <Collapsible title="Watch Identity" Icon={Watch} defaultOpen accentColor={C.accent}>
            <LabeledInput label="Watch Name" value={localName} onChangeText={setLocalName} placeholder="Casio ABL-100WE" />
          </Collapsible>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <Collapsible title="BLE Configuration" Icon={Bluetooth} accentColor={C.accentBlue}>
            <View style={styles.hintBox}>
              <Info size={13} color={C.accentBlue} strokeWidth={2} />
              <Text style={styles.hintText}>Configure BLE UUIDs to match your specific Casio model. Leave blank to use defaults.</Text>
            </View>
            <LabeledInput label="Service UUID" value={localServiceUUID} onChangeText={setLocalServiceUUID} placeholder="Default service UUID" />
            <LabeledInput label="Steps Characteristic" value={localStepUUID} onChangeText={setLocalStepUUID} placeholder="Steps char UUID" />
            <LabeledInput label="Calories Characteristic" value={localCalUUID} onChangeText={setLocalCalUUID} placeholder="Calories char UUID" />
            <LabeledInput label="Distance Characteristic" value={localDistUUID} onChangeText={setLocalDistUUID} placeholder="Distance char UUID" />
          </Collapsible>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Collapsible title="How to find UUIDs" Icon={Radio} accentColor={C.accentTeal}>
            <View style={styles.stepItem}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
              <Text style={styles.stepText}>Install "nRF Connect" (Nordic Semiconductor) on your phone</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
              <Text style={styles.stepText}>Scan and connect to your Casio watch</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
              <Text style={styles.stepText}>Browse services and copy the UUID that contains step/fitness data</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View>
              <Text style={styles.stepText}>Paste the UUIDs in the BLE Configuration section above</Text>
            </View>
          </Collapsible>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Collapsible title="Notifications" Icon={Bell} accentColor={C.warning}>
            <View style={styles.reminderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderTitle}>Step Reminders</Text>
                <Text style={styles.reminderSub}>Get reminded to move throughout the day</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ false: C.border, true: `${C.warning}66` }}
                thumbColor={reminderEnabled ? C.warning : C.textMuted}
              />
            </View>
          </Collapsible>
        </Animated.View>

        <TouchableOpacity style={styles.fullSaveBtn} onPress={handleSave} activeOpacity={0.85}>
          {saved ? (
            <>
              <CheckCircle size={20} color={C.background} strokeWidth={2.5} />
              <Text style={styles.fullSaveBtnText}>Saved!</Text>
            </>
          ) : (
            <>
              <Save size={20} color={C.background} strokeWidth={2.5} />
              <Text style={styles.fullSaveBtnText}>Save Settings</Text>
            </>
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
  saveBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  saveBtnDone: { backgroundColor: C.accentGreen },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { ...F.semibold, fontSize: 13 },
  collapsible: { backgroundColor: C.backgroundCard, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  collapsibleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  collapsibleIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  collapsibleTitle: { flex: 1, color: C.text, ...F.semibold, fontSize: 14 },
  collapsibleBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 12 },
  inputGroup: { gap: 6 },
  inputLabel: { color: C.textSecondary, ...F.medium, fontSize: 12 },
  input: { backgroundColor: C.backgroundElevated, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 11, color: C.text, ...F.regular, fontSize: 14, borderWidth: 1, borderColor: C.border },
  hintBox: { flexDirection: 'row', gap: 8, backgroundColor: `${C.accentBlue}11`, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: `${C.accentBlue}33` },
  hintText: { flex: 1, color: C.textSecondary, ...F.regular, fontSize: 12, lineHeight: 18 },
  stepItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.accentTeal, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText: { color: C.background, ...F.bold, fontSize: 12 },
  stepText: { flex: 1, color: C.textSecondary, ...F.regular, fontSize: 13, lineHeight: 20 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderTitle: { color: C.text, ...F.medium, fontSize: 14, marginBottom: 2 },
  reminderSub: { color: C.textMuted, ...F.regular, fontSize: 12 },
  fullSaveBtn: { backgroundColor: C.accent, borderRadius: 16, paddingVertical: 17, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  fullSaveBtnText: { color: C.background, ...F.bold, fontSize: 16 },
});
