import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GlowCard } from '../components/GlowCard';
import { NeoHeader } from '../components/NeoHeader';
import { AuthService } from '../services/AuthService';
import { StorageService } from '../services/StorageService';
import { useStore } from '../store/useStore';
import { Colors, Radii, Spacing, Typography } from '../theme';
import { generateDemoHistory } from '../utils/helpers';

export const SettingsScreen: React.FC = () => {
  const { user, dailyGoal, updateDailyGoal, setUser, setActivityHistory, devices } = useStore();
  const [goalSteps, setGoalSteps] = useState(String(dailyGoal.steps));
  const [goalCals, setGoalCals] = useState(String(dailyGoal.calories));
  const [goalKm, setGoalKm] = useState(String(dailyGoal.distanceKm));

  const saveGoals = () => {
    const steps = parseInt(goalSteps, 10);
    const calories = parseInt(goalCals, 10);
    const distanceKm = parseFloat(goalKm);
    if (isNaN(steps) || isNaN(calories) || isNaN(distanceKm)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for all goals.');
      return;
    }
    updateDailyGoal({ steps, calories, distanceKm });
    Alert.alert('Saved!', 'Your daily goals have been updated.');
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AuthService.signOut();
          setUser(null);
        },
      },
    ]);
  };

  const handleLoadDemo = () => {
    const history = generateDemoHistory();
    setActivityHistory(history);
    Alert.alert('Demo Data Loaded', 'Loaded 30 days of sample activity data.');
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will remove all activity history. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setActivityHistory([]);
          Alert.alert('Cleared', 'All activity data removed.');
        },
      },
    ]);
  };

  const Row = ({
    label,
    value,
    color = Colors.primary,
  }: {
    label: string;
    value: string;
    color?: string;
  }) => (
    <View style={styles.infoRow}>
      <Text style={[Typography.bodySmall, styles.infoLabel]}>{label}</Text>
      <Text style={[Typography.bodySmall, { color }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <NeoHeader title="Settings" />

      {/* Profile */}
      <GlowCard>
        <Text style={[Typography.label, styles.sectionLabel]}>Account</Text>
        {user ? (
          <>
            <Row label="Name" value={user.name} />
            <Row label="Email" value={user.email} />
            <TouchableOpacity onPress={handleSignOut} style={styles.dangerBtn}>
              <Text style={[Typography.label, { color: Colors.accent }]}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[Typography.body, styles.mutedText]}>Not signed in</Text>
        )}
      </GlowCard>

      {/* Daily Goals */}
      <GlowCard glowColor={Colors.greenGlow}>
        <Text style={[Typography.label, styles.sectionLabel]}>Daily Goals</Text>

        <Text style={[Typography.bodySmall, styles.inputLabel]}>Steps Goal</Text>
        <TextInput
          style={styles.input}
          value={goalSteps}
          onChangeText={setGoalSteps}
          keyboardType="numeric"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={[Typography.bodySmall, styles.inputLabel]}>Calories Goal (kcal)</Text>
        <TextInput
          style={styles.input}
          value={goalCals}
          onChangeText={setGoalCals}
          keyboardType="numeric"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={[Typography.bodySmall, styles.inputLabel]}>Distance Goal (km)</Text>
        <TextInput
          style={styles.input}
          value={goalKm}
          onChangeText={setGoalKm}
          keyboardType="decimal-pad"
          placeholderTextColor={Colors.textMuted}
        />

        <TouchableOpacity onPress={saveGoals} style={styles.saveBtn}>
          <Text style={[Typography.label, { color: Colors.textInverse }]}>Save Goals</Text>
        </TouchableOpacity>
      </GlowCard>

      {/* Device Info */}
      <GlowCard>
        <Text style={[Typography.label, styles.sectionLabel]}>Devices ({devices.length})</Text>
        {devices.map((d) => (
          <Row
            key={d.id}
            label={d.name}
            value={d.connected ? 'Connected' : 'Offline'}
            color={d.connected ? Colors.green : Colors.textMuted}
          />
        ))}
        {devices.length === 0 && (
          <Text style={[Typography.bodySmall, styles.mutedText]}>No devices paired</Text>
        )}
      </GlowCard>

      {/* Data Management */}
      <GlowCard>
        <Text style={[Typography.label, styles.sectionLabel]}>Data</Text>
        <TouchableOpacity onPress={handleLoadDemo} style={styles.actionBtn}>
          <Text style={[Typography.body, { color: Colors.primary }]}>Load Demo Data</Text>
          <Text style={[Typography.caption, styles.mutedText]}>30 days of sample activity</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearData} style={[styles.actionBtn, styles.dangerAction]}>
          <Text style={[Typography.body, { color: Colors.accent }]}>Clear Activity Data</Text>
          <Text style={[Typography.caption, styles.mutedText]}>Remove all recorded history</Text>
        </TouchableOpacity>
      </GlowCard>

      {/* App Info */}
      <GlowCard>
        <Text style={[Typography.label, styles.sectionLabel]}>About CasioSync</Text>
        <Row label="Version" value="1.0.0" />
        <Row label="BLE Library" value="react-native-ble-plx" />
        <Row label="Storage" value="MMKV (ultra-fast)" />
        <Row label="Formatter" value="Biome" />
        <Row label="Compatible" value="Casio ABL-100WE + more" />
      </GlowCard>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  sectionLabel: { color: Colors.textSecondary, marginBottom: Spacing.md },
  inputLabel: { color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontSize: 15,
  },
  saveBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  dangerBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Radii.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: { color: Colors.textSecondary },
  mutedText: { color: Colors.textMuted },
  actionBtn: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dangerAction: {
    borderBottomWidth: 0,
  },
  footer: { height: Spacing.xxl },
});
