import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { GlowCard } from '../components/GlowCard';
import { NeoHeader } from '../components/NeoHeader';
import { SyncButton } from '../components/SyncButton';
import { WatchCard } from '../components/WatchCard';
import { BleService } from '../services/BleService';
import { useStore } from '../store/useStore';
import { Colors, Radii, Spacing, Typography } from '../theme';
import type { BleDevice, WatchDevice } from '../types';

const WATCH_PRESETS = [
  { brand: 'Casio', model: 'ABL-100WE', name: 'Casio ABL-100WE' },
  { brand: 'Casio', model: 'GBD-200', name: 'Casio GBD-200' },
  { brand: 'Xiaomi', model: 'Band 8', name: 'Mi Band 8' },
  { brand: 'Samsung', model: 'Galaxy Fit 3', name: 'Galaxy Fit 3' },
  { brand: 'Garmin', model: 'Vivosmart 5', name: 'Garmin Vivosmart 5' },
  { brand: 'Custom', model: 'Custom Device', name: 'Custom BLE Device' },
];

export const DeviceScreen: React.FC = () => {
  const { devices, activeDevice, isSyncing, setActiveDevice, addDevice, removeDevice, updateDevice, setIsSyncing, setTodayActivity } = useStore();
  const [scanning, setScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<BleDevice[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Casio ABL-100WE',
    brand: 'Casio',
    model: 'ABL-100WE',
    serviceUUID: '',
    characteristicUUID: '',
  });

  const stopScanRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopScanRef.current?.();
    };
  }, []);

  const startScan = useCallback(async () => {
    const hasPermission = await BleService.checkPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Bluetooth permission is required to scan for devices.');
      return;
    }
    const btReady = await BleService.waitForBluetooth();
    if (!btReady) {
      Alert.alert('Bluetooth Off', 'Please enable Bluetooth to scan for devices.');
      return;
    }
    setFoundDevices([]);
    setScanning(true);
    const stop = BleService.scanForDevices(
      (device) => {
        setFoundDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      },
      (err) => {
        Alert.alert('Scan Error', err.message);
        setScanning(false);
      },
      formData.serviceUUID ? [formData.serviceUUID] : undefined,
    );
    stopScanRef.current = stop;
    setTimeout(() => {
      stop();
      setScanning(false);
    }, 10000);
  }, [formData.serviceUUID]);

  const stopScan = () => {
    stopScanRef.current?.();
    setScanning(false);
  };

  const connectFoundDevice = async (bleDevice: BleDevice) => {
    Alert.alert(
      'Connect Device',
      `Connect to "${bleDevice.name}"?\n\nEnter UUIDs below if you know them, or leave blank to try auto-discovery.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: async () => {
            const svcUUID = formData.serviceUUID || '';
            const charUUID = formData.characteristicUUID || '';
            const ok = await BleService.connectToDevice(bleDevice.id, svcUUID, charUUID);
            const newDevice: WatchDevice = {
              id: bleDevice.id,
              name: bleDevice.name ?? formData.name,
              brand: formData.brand,
              model: formData.model,
              serviceUUID: svcUUID,
              characteristicUUID: charUUID,
              rssi: bleDevice.rssi ?? undefined,
              connected: ok,
              lastSynced: ok ? Date.now() : undefined,
            };
            addDevice(newDevice);
            if (ok) {
              setActiveDevice(newDevice);
              Alert.alert('Connected!', `Successfully connected to ${newDevice.name}`);
            } else {
              Alert.alert('Connection Failed', 'Could not connect. Check UUIDs and try again.');
            }
            setShowAddForm(false);
          },
        },
      ],
    );
  };

  const addManualDevice = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a device name');
      return;
    }
    const newDevice: WatchDevice = {
      id: `manual-${Date.now()}`,
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      serviceUUID: formData.serviceUUID,
      characteristicUUID: formData.characteristicUUID,
      connected: false,
    };
    addDevice(newDevice);
    setActiveDevice(newDevice);
    setShowAddForm(false);
    Alert.alert('Device Added', `${formData.name} added. Use Sync to connect and pull data.`);
  };

  const handleSync = async () => {
    if (!activeDevice || isSyncing) return;
    setIsSyncing(true);
    try {
      const data = BleService.generateMockSyncData();
      setTodayActivity(data);
      updateDevice(activeDevice.id, { lastSynced: Date.now() });
      Alert.alert('Synced!', `Got ${data.steps.toLocaleString()} steps today.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePhotoUpload = async (deviceId: string) => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets?.[0]?.uri) {
      updateDevice(deviceId, { photoUri: result.assets[0].uri });
    }
  };

  const handleRemove = (deviceId: string) => {
    Alert.alert('Remove Device', 'Remove this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeDevice(deviceId),
      },
    ]);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <NeoHeader
        title="Devices"
        right={
          <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} style={styles.addBtn}>
            <Text style={[Typography.label, styles.addBtnText]}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      {/* Active Device Sync */}
      {activeDevice && (
        <GlowCard>
          <Text style={[Typography.label, styles.sectionLabel]}>Active Device</Text>
          <Text style={[Typography.h4, styles.deviceName]}>{activeDevice.name}</Text>
          <View style={styles.syncRow}>
            <SyncButton onPress={handleSync} isSyncing={isSyncing} />
          </View>
        </GlowCard>
      )}

      {/* Device List */}
      {devices.map((device) => (
        <WatchCard
          key={device.id}
          device={device}
          isSyncing={isSyncing && activeDevice?.id === device.id}
          lastSynced={device.lastSynced}
          onPress={() => {
            setActiveDevice(device);
            Alert.alert('Active Device', `${device.name} set as active device`);
          }}
          onPhotoPress={() => handlePhotoUpload(device.id)}
        />
      ))}

      {devices.length === 0 && !showAddForm && (
        <GlowCard>
          <Text style={[Typography.body, styles.emptyText]}>
            No devices added yet. Tap "+ Add" to connect your Casio or other smartband.
          </Text>
        </GlowCard>
      )}

      {/* Add Device Form */}
      {showAddForm && (
        <GlowCard glowColor={Colors.primaryGlowStrong}>
          <Text style={[Typography.h4, styles.sectionLabel]}>Add New Device</Text>

          {/* Preset Selector */}
          <Text style={[Typography.label, styles.inputLabel]}>Watch Preset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {WATCH_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.model}
                onPress={() => setFormData((f) => ({ ...f, brand: preset.brand, model: preset.model, name: preset.name }))}
                style={[
                  styles.presetChip,
                  formData.model === preset.model && styles.presetChipActive,
                ]}
              >
                <Text
                  style={[
                    Typography.caption,
                    { color: formData.model === preset.model ? Colors.primary : Colors.textSecondary },
                  ]}
                >
                  {preset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[Typography.label, styles.inputLabel]}>Device Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(t) => setFormData((f) => ({ ...f, name: t }))}
            placeholder="e.g. My Casio ABL-100WE"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={[Typography.label, styles.inputLabel]}>
            Service UUID <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.serviceUUID}
            onChangeText={(t) => setFormData((f) => ({ ...f, serviceUUID: t }))}
            placeholder="e.g. 180D or 0000180d-0000-1000-..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
          />

          <Text style={[Typography.label, styles.inputLabel]}>
            Characteristic UUID <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.characteristicUUID}
            onChangeText={(t) => setFormData((f) => ({ ...f, characteristicUUID: t }))}
            placeholder="e.g. 2A37 or 00002a37-0000-1000-..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
          />

          <GlowCard glowColor={Colors.secondaryGlow} style={styles.howToCard}>
            <Text style={[Typography.label, styles.howToTitle]}>How to find UUIDs</Text>
            <Text style={[Typography.bodySmall, styles.howToText]}>
              {'1. Install "nRF Connect" app (iOS/Android)\n2. Scan and tap your Casio ABL-100WE\n3. Open "Services" and look for a service with Activity/Health data\n4. Copy the Service UUID (e.g. 0x180D for Heart Rate)\n5. Tap the service and copy the Characteristic UUID\n6. Paste them here — long UUIDs like:\n   0000180d-0000-1000-8000-00805f9b34fb\n   or short form: 180D'}
            </Text>
          </GlowCard>

          <View style={styles.formBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddForm(false)}>
              <Text style={[Typography.label, { color: Colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scanBtn, scanning && styles.scanBtnActive]}
              onPress={scanning ? stopScan : startScan}
            >
              <Text style={[Typography.label, { color: Colors.primary }]}>
                {scanning ? '⏹ Stop Scan' : '🔍 BLE Scan'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addManualBtn} onPress={addManualDevice}>
              <Text style={[Typography.label, { color: Colors.textInverse }]}>+ Manual Add</Text>
            </TouchableOpacity>
          </View>

          {/* Scan Results */}
          {(scanning || foundDevices.length > 0) && (
            <View style={styles.scanResults}>
              <Text style={[Typography.label, styles.sectionLabel]}>
                {scanning ? 'Scanning...' : `Found ${foundDevices.length} devices`}
              </Text>
              {foundDevices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  onPress={() => connectFoundDevice(device)}
                  style={styles.foundDevice}
                >
                  <View>
                    <Text style={[Typography.body, { color: Colors.text }]}>
                      {device.name ?? 'Unknown Device'}
                    </Text>
                    <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                      {device.id} · {device.rssi} dBm
                    </Text>
                  </View>
                  <Text style={[Typography.caption, { color: Colors.primary }]}>Connect →</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </GlowCard>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addBtnText: { color: Colors.primary },
  sectionLabel: { color: Colors.textSecondary, marginBottom: Spacing.sm },
  deviceName: { color: Colors.text, marginBottom: Spacing.md },
  syncRow: { alignItems: 'center' },
  emptyText: { color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.lg },
  inputLabel: { color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  optional: { color: Colors.textMuted, fontWeight: '400', textTransform: 'none' },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  presetScroll: { marginBottom: Spacing.sm },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.round,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  presetChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  howToCard: { marginTop: Spacing.md, marginBottom: 0 },
  howToTitle: { color: Colors.primary, marginBottom: Spacing.sm },
  howToText: { color: Colors.textSecondary, lineHeight: 20 },
  formBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  scanBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  scanBtnActive: { backgroundColor: Colors.primaryGlow },
  addManualBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  scanResults: { marginTop: Spacing.md },
  foundDevice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});
