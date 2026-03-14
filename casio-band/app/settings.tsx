import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Switch, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  X, Bluetooth, Settings, Bell, Clock, ChevronDown, ChevronUp, CheckCircle,
  Info, Zap, Radio, Watch, Save,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { useFitness } from "@/context/FitnessContext";

const C = Colors.dark;
const F = { regular: "SpaceGrotesk_400Regular", medium: "SpaceGrotesk_500Medium", semibold: "SpaceGrotesk_600SemiBold", bold: "SpaceGrotesk_700Bold" };

const REMINDER_KEY = "@casio_step_reminder";

async function scheduleStepReminder(hour: number, minute: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (Platform.OS !== "web") {
    await Notifications.scheduleNotificationAsync({
      content: { title: "Move it! 👟", body: "Time to hit your step goal. Every step counts.", sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  }
}

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

function StepItem({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumBg}><Text style={styles.stepNum}>{number}</Text></View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function HintBox({ text }: { text: string }) {
  return (
    <View style={styles.hintBox}>
      <Info size={13} color={C.accentBlue} strokeWidth={2} />
      <Text style={styles.hintText}>{text}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    watchName, setWatchName,
    customServiceUUID, setCustomServiceUUID,
    customStepCharUUID, setCustomStepCharUUID,
    customCalCharUUID, setCustomCalCharUUID,
    customDistCharUUID, setCustomDistCharUUID,
  } = useFitness();
  const [localName, setLocalName] = useState(watchName);
  const [localServiceUUID, setLocalServiceUUID] = useState(customServiceUUID ?? "");
  const [localStepUUID, setLocalStepUUID] = useState(customStepCharUUID ?? "");
  const [localCalUUID, setLocalCalUUID] = useState(customCalCharUUID ?? "");
  const [localDistUUID, setLocalDistUUID] = useState(customDistCharUUID ?? "");
  const [saved, setSaved] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem(REMINDER_KEY).then(raw => {
      if (raw) {
        const d = JSON.parse(raw);
        setReminderEnabled(d.enabled);
        setReminderHour(d.hour);
        setReminderMinute(d.minute);
      }
    });
  }, []);

  const handleReminderToggle = async (val: boolean) => {
    setReminderEnabled(val);
    if (val) {
      if (Platform.OS !== "web") {
        const { status: s } = await Notifications.requestPermissionsAsync();
        if (s !== "granted") {
          Alert.alert("Permission Needed", "Please allow notifications in your device settings.");
          setReminderEnabled(false);
          return;
        }
      }
      await scheduleStepReminder(reminderHour, reminderMinute);
    } else {
      if (Platform.OS !== "web") await Notifications.cancelAllScheduledNotificationsAsync();
    }
    await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify({ enabled: val, hour: reminderHour, minute: reminderMinute }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleReminderTimeSave = async () => {
    if (reminderEnabled) await scheduleStepReminder(reminderHour, reminderMinute);
    await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify({ enabled: reminderEnabled, hour: reminderHour, minute: reminderMinute }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSave = useCallback(async () => {
    await setWatchName(localName.trim() || "My Casio");
    await setCustomServiceUUID(localServiceUUID.trim() || null);
    await setCustomStepCharUUID(localStepUUID.trim() || null);
    await setCustomCalCharUUID(localCalUUID.trim() || null);
    await setCustomDistCharUUID(localDistUUID.trim() || null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [localName, localServiceUUID, localStepUUID, localCalUUID, localDistUUID]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={C.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        <SectionHeader Icon={Info} title="How to Use" color={C.accentBlue} />

        <Collapsible title="Getting Started" Icon={Zap} accentColor={C.accent}>
          <StepItem number={1} text="Open this app in Expo Go on your iOS or Android phone" />
          <StepItem number={2} text="Enable Bluetooth and grant location permissions when prompted" />
          <StepItem number={3} text="Navigate to the Watch tab and tap 'Connect'" />
          <StepItem number={4} text="Keep your Casio ABL-100WE powered on and nearby" />
          <StepItem number={5} text="After connecting, tap 'Sync Watch' on the Dashboard to load your data" />
          <HintBox text="If your watch doesn't appear, toggle Bluetooth off/on and rescan." />
        </Collapsible>

        <Collapsible title="Connecting Your Casio" Icon={Bluetooth} accentColor={C.accent}>
          <StepItem number={1} text="Power on your Casio ABL-100WE — press the top-right button to wake it" />
          <StepItem number={2} text="On your phone, tap 'Scan for Devices' from the Connect screen" />
          <StepItem number={3} text="Your watch appears as 'CASIO' or 'ABL-100WE' in the discovered list" />
          <StepItem number={4} text="Tap the watch name — a pairing dialog may appear on iOS, tap Pair" />
          <StepItem number={5} text="A green glow on the watch icon means you're connected" />
          <StepItem number={6} text="Tap 'Sync Watch' to pull the latest step/calorie/distance data" />
          <HintBox text="First connection can take 10–15 seconds. The watch must be unpaired from all other apps first." />
        </Collapsible>

        <Collapsible title="Finding UUIDs with nRF Connect" Icon={Radio} accentColor={C.accentBlue}>
          <StepItem number={1} text="Download 'nRF Connect for Mobile' (Nordic Semiconductor) from App Store or Play Store — free" />
          <StepItem number={2} text="Open nRF Connect → tap 'SCAN' → find your Casio in the list" />
          <StepItem number={3} text="Tap 'CONNECT' next to your Casio device name" />
          <StepItem number={4} text="You'll see a list of Services, each with a UUID like: 0000xxxx-0000-1000-8000-00805f9b34fb" />
          <StepItem number={5} text="Tap each service to expand it and see its Characteristics" />
          <StepItem number={6} text="Tap the READ button (arrow icon) on each characteristic to see its value" />
          <StepItem number={7} text="Look for characteristics returning numeric step/calorie/distance values" />
          <StepItem number={8} text="Long-press any UUID in nRF Connect to copy it" />
          <StepItem number={9} text="Paste the Service UUID and matching Characteristic UUIDs below in UUID Config" />
          <HintBox text="Common fitness UUIDs: Service 0x1814 (Running Speed & Cadence), Char 0x2A53 for RSC Measurement. Your Casio may use proprietary ones starting with FA or FE." />
          <HintBox text="Tip: Tap NOTIFY (bell icon) on a characteristic to watch live updates as you walk in place — that's the step counter." />
        </Collapsible>

        <Collapsible title="App Features Overview" Icon={Watch} accentColor={C.accentTeal}>
          <View style={{ gap: 10 }}>
            {[
              { icon: "📊", title: "Dashboard", desc: "Real-time steps, calories, distance with ring progress and sync button" },
              { icon: "📈", title: "Graphs", desc: "7-day line charts, bar chart goal progress, 30-day averages" },
              { icon: "💡", title: "Tips", desc: "12 science-backed fitness insights, expandable, filter by category" },
              { icon: "⌚", title: "Watch Tab", desc: "Connection status, battery, watch photo, find-phone, cloud sync" },
              { icon: "🔔", title: "Step Reminder", desc: "Daily notification at a time you choose to move and hit your goal" },
              { icon: "🏅", title: "KM Badges", desc: "Earn milestone badges at 1, 10, 50, 100, 250, 500, 1000 km" },
              { icon: "🔥", title: "Streak", desc: "Consecutive days meeting step goal — keep the streak alive!" },
              { icon: "📍", title: "Location Log", desc: "GPS-based activity map with route visualization" },
            ].map(item => (
              <View key={item.title} style={styles.featureItem}>
                <Text style={styles.featureIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Collapsible>

        <SectionHeader Icon={Bell} title="Step Reminder" color={C.accentGreen} />

        <Animated.View entering={FadeInDown.springify()} style={styles.card}>
          <View style={styles.reminderToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>Daily Step Reminder</Text>
              <Text style={styles.cardSub}>Get notified once per day to hit your goal</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleReminderToggle}
              trackColor={{ false: C.border, true: `${C.accentGreen}88` }}
              thumbColor={reminderEnabled ? C.accentGreen : C.textMuted}
            />
          </View>

          {reminderEnabled && (
            <View style={styles.timePickerSection}>
              <Text style={styles.timeLabel}>Remind me at</Text>
              <View style={styles.timePicker}>
                <View style={styles.timeColumn}>
                  <TouchableOpacity onPress={() => setReminderHour(h => (h + 1) % 24)} style={styles.timeBtn}>
                    <ChevronUp size={20} color={C.accent} strokeWidth={2} />
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{pad(reminderHour)}</Text>
                  <TouchableOpacity onPress={() => setReminderHour(h => (h + 23) % 24)} style={styles.timeBtn}>
                    <ChevronDown size={20} color={C.accent} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.timeSep}>:</Text>
                <View style={styles.timeColumn}>
                  <TouchableOpacity onPress={() => setReminderMinute(m => (m + 15) % 60)} style={styles.timeBtn}>
                    <ChevronUp size={20} color={C.accent} strokeWidth={2} />
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{pad(reminderMinute)}</Text>
                  <TouchableOpacity onPress={() => setReminderMinute(m => (m + 45) % 60)} style={styles.timeBtn}>
                    <ChevronDown size={20} color={C.accent} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.reminderPreview}>
                Fires daily at {pad(reminderHour)}:{pad(reminderMinute)} · 15-min intervals
              </Text>
              <TouchableOpacity style={styles.saveTimeBtn} onPress={handleReminderTimeSave}>
                <Clock size={14} color={C.background} strokeWidth={2.5} />
                <Text style={styles.saveTimeBtnText}>Apply Reminder Time</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        <SectionHeader Icon={Watch} title="Watch Settings" />

        <Animated.View entering={FadeInDown.delay(40).springify()} style={styles.card}>
          <Text style={styles.cardLabel}>Watch Name</Text>
          <TextInput
            style={styles.input}
            value={localName}
            onChangeText={setLocalName}
            placeholder="e.g. My Casio ABL-100WE"
            placeholderTextColor={C.textMuted}
            autoCapitalize="words"
          />
        </Animated.View>

        <SectionHeader Icon={Radio} title="BLE UUID Config" color={C.accentBlue} />

        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.card}>
          <Text style={styles.uuidNote}>
            Use nRF Connect to discover your watch's UUIDs (see guide above). Leave blank to use standard fitness UUIDs.
          </Text>
          {[
            { label: "Service UUID", value: localServiceUUID, set: setLocalServiceUUID, placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
            { label: "Step Count Characteristic UUID", value: localStepUUID, set: setLocalStepUUID, placeholder: "Step char UUID" },
            { label: "Calories Characteristic UUID", value: localCalUUID, set: setLocalCalUUID, placeholder: "Calorie char UUID" },
            { label: "Distance Characteristic UUID", value: localDistUUID, set: setLocalDistUUID, placeholder: "Distance char UUID" },
          ].map(field => (
            <View key={field.label} style={styles.uuidField}>
              <Text style={styles.uuidLabel}>{field.label}</Text>
              <TextInput
                style={styles.uuidInput}
                value={field.value}
                onChangeText={field.set}
                placeholder={field.placeholder}
                placeholderTextColor={C.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}
        </Animated.View>

        <TouchableOpacity style={[styles.saveBtn, saved && { backgroundColor: C.accentGreen }]} onPress={handleSave}>
          {saved ? <CheckCircle size={20} color={C.background} strokeWidth={2.5} /> : <Save size={20} color={C.background} strokeWidth={2} />}
          <Text style={styles.saveBtnText}>{saved ? "Settings Saved!" : "Save Settings"}</Text>
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
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 12 },
  sectionTitle: { color: C.textSecondary, fontFamily: F.semibold, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5 },
  card: { backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12, gap: 12 },
  cardLabel: { color: C.text, fontFamily: F.semibold, fontSize: 15 },
  cardSub: { color: C.textMuted, fontFamily: F.regular, fontSize: 12, marginTop: 2 },
  collapsible: { backgroundColor: C.backgroundCard, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  collapsibleHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  collapsibleIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  collapsibleTitle: { flex: 1, color: C.text, fontFamily: F.semibold, fontSize: 14 },
  collapsibleBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  stepItem: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNumBg: { width: 26, height: 26, borderRadius: 13, backgroundColor: `${C.accent}22`, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  stepNum: { color: C.accent, fontFamily: F.bold, fontSize: 12 },
  stepText: { flex: 1, color: C.textSecondary, fontFamily: F.regular, fontSize: 13, lineHeight: 20 },
  hintBox: { flexDirection: "row", gap: 8, backgroundColor: `${C.accentBlue}11`, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: `${C.accentBlue}33` },
  hintText: { flex: 1, color: C.accentBlue, fontFamily: F.regular, fontSize: 12, lineHeight: 18 },
  featureItem: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  featureIcon: { fontSize: 18, width: 28, textAlign: "center" },
  featureTitle: { color: C.text, fontFamily: F.semibold, fontSize: 13 },
  featureDesc: { color: C.textMuted, fontFamily: F.regular, fontSize: 12, lineHeight: 18, marginTop: 2 },
  reminderToggleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  timePickerSection: { gap: 14, alignItems: "center", paddingTop: 4 },
  timeLabel: { color: C.textMuted, fontFamily: F.medium, fontSize: 13 },
  timePicker: { flexDirection: "row", alignItems: "center", gap: 20, backgroundColor: C.backgroundElevated, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 36, borderWidth: 1, borderColor: C.borderGlow },
  timeColumn: { alignItems: "center", gap: 8 },
  timeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${C.accent}22`, alignItems: "center", justifyContent: "center" },
  timeValue: { color: C.text, fontFamily: F.bold, fontSize: 40, minWidth: 60, textAlign: "center" },
  timeSep: { color: C.accent, fontFamily: F.bold, fontSize: 44, marginBottom: 8 },
  reminderPreview: { color: C.accentGreen, fontFamily: F.semibold, fontSize: 13 },
  saveTimeBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.accentGreen, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  saveTimeBtnText: { color: C.background, fontFamily: F.bold, fontSize: 14 },
  input: { backgroundColor: C.backgroundElevated, borderRadius: 12, padding: 14, color: C.text, fontFamily: F.regular, fontSize: 14, borderWidth: 1, borderColor: C.border },
  uuidNote: { color: C.textMuted, fontFamily: F.regular, fontSize: 12, lineHeight: 18 },
  uuidField: { gap: 6 },
  uuidLabel: { color: C.textSecondary, fontFamily: F.medium, fontSize: 13 },
  uuidInput: { backgroundColor: C.backgroundElevated, borderRadius: 10, padding: 12, color: C.text, fontFamily: "SpaceGrotesk_400Regular", fontSize: 12, borderWidth: 1, borderColor: C.border },
  saveBtn: { backgroundColor: C.accent, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18, marginBottom: 20 },
  saveBtnText: { color: C.background, fontFamily: F.bold, fontSize: 16 },
});
