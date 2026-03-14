import * as Haptics from 'expo-haptics';
import { Bluetooth, ChevronRight, Cpu, Info, Plus, Trash2, Watch } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { NeoCard } from '@/components/ui/NeoCard';
import { ConnectionPulse } from '@/components/ui/ConnectionPulse';
import { Device, DeviceType, useApp } from '@/context/AppContext';
import { useBle } from '@/context/BleContext';

interface ScannedDevice {
  id: string;
  name: string | null;
}

type LucideIcon = React.ComponentType<{ size: number; color: string }>;

const DEVICE_TEMPLATES: { name: string; type: DeviceType; serviceUUID: string; charUUID: string; Icon: LucideIcon }[] = [
  {
    name: 'Casio ABL-100WE',
    type: 'casio_abl100we',
    serviceUUID: '00001804-0000-1000-8000-00805f9b34fb',
    charUUID: '00002a19-0000-1000-8000-00805f9b34fb',
    Icon: Watch,
  },
  {
    name: 'Custom Band',
    type: 'custom',
    serviceUUID: '',
    charUUID: '',
    Icon: Cpu,
  },
];

export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const { devices, activeDeviceId, addDevice, removeDevice, setActiveDevice } = useApp();
  const ble = useBle();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [form, setForm] = useState({ name: '', serviceUUID: '', characteristicUUID: '', macAddress: '' });

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const handleAddDevice = async () => {
    if (!form.name.trim() || !form.serviceUUID.trim()) {
      Alert.alert('Required', 'Please fill in device name and Service UUID.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const type: DeviceType = DEVICE_TEMPLATES[selectedTemplate]?.type ?? 'custom';
    await addDevice({
      name: form.name.trim(),
      type,
      serviceUUID: form.serviceUUID.trim(),
      characteristicUUID: form.characteristicUUID.trim(),
      macAddress: form.macAddress.trim() || undefined,
    });
    setShowAddModal(false);
    setForm({ name: '', serviceUUID: '', characteristicUUID: '', macAddress: '' });
  };

  const handleRemoveDevice = (device: Device) => {
    Alert.alert(
      'Remove Device',
      `Remove "${device.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            removeDevice(device.id);
          },
        },
      ],
    );
  };

  const handleStartScan = () => {
    setShowScanModal(true);
    ble.startScan();
  };

  const handleSelectScanned = (bleDevice: ScannedDevice) => {
    setShowScanModal(false);
    ble.stopScan();
    setForm(f => ({
      ...f,
      name: bleDevice.name ?? bleDevice.id,
      macAddress: bleDevice.id,
    }));
    setShowAddModal(true);
  };

  const applyTemplate = (idx: number) => {
    setSelectedTemplate(idx);
    const t = DEVICE_TEMPLATES[idx];
    setForm(f => ({
      ...f,
      name: t.name,
      serviceUUID: t.serviceUUID,
      characteristicUUID: t.charUUID,
    }));
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <View>
            <Text style={styles.title}>Devices</Text>
            <Text style={styles.subtitle}>{devices.length} device{devices.length !== 1 ? 's' : ''} paired</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [styles.scanBtn, pressed && { opacity: 0.8 }]}
              onPress={handleStartScan}
            >
              <Bluetooth size={16} color={Colors.accent} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={18} color={Colors.bg} />
            </Pressable>
          </View>
        </Animated.View>

        {ble.bleError ? (
          <Animated.View entering={FadeIn} style={styles.bleInfo}>
            <Info size={16} color={Colors.amber} />
            <Text style={styles.bleInfoText}>{ble.bleError}</Text>
          </Animated.View>
        ) : null}

        <NeoCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Info size={16} color={Colors.neon} />
            <Text style={styles.infoText}>
              To connect your Casio ABL-100WE, enable pairing mode on the watch and tap "Scan" or add manually.
              The NRF Connect app can help you find your watch's UUIDs.
            </Text>
          </View>
        </NeoCard>

        {devices.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.emptyState}>
            <Watch size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No devices yet</Text>
            <Text style={styles.emptyText}>
              Tap the + button to add your Casio ABL-100WE or any other BLE smartband
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyAddBtn, pressed && { opacity: 0.85 }]}
              onPress={() => { applyTemplate(0); setShowAddModal(true); }}
            >
              <Watch size={16} color={Colors.bg} />
              <Text style={styles.emptyAddBtnText}>Add Casio ABL-100WE</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.deviceList}>
            {devices.map((device, i) => (
              <Animated.View key={device.id} entering={FadeInDown.delay(i * 60).springify()}>
                <DeviceRow
                  device={device}
                  isActive={device.id === activeDeviceId}
                  isConnected={ble.connectedDevice?.id === device.id}
                  onSetActive={() => setActiveDevice(device.id === activeDeviceId ? null : device.id)}
                  onRemove={() => handleRemoveDevice(device)}
                />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      <AddDeviceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddDevice}
        form={form}
        setForm={setForm}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={applyTemplate}
        onScan={handleStartScan}
      />

      <ScanModal
        visible={showScanModal}
        onClose={() => { setShowScanModal(false); ble.stopScan(); }}
        devices={ble.scannedDevices}
        scanning={ble.isScanning}
        onSelect={handleSelectScanned}
      />
    </View>
  );
}

function DeviceRow({ device, isActive, isConnected, onSetActive, onRemove }: {
  device: Device; isActive: boolean; isConnected: boolean;
  onSetActive: () => void; onRemove: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.deviceRow,
        isActive && { borderColor: Colors.neonBorder },
        pressed && { opacity: 0.9 },
      ]}
      onPress={onSetActive}
    >
      <ConnectionPulse connected={isConnected} size={8} />
      <View style={styles.deviceRowInfo}>
        <Text style={styles.deviceRowName} numberOfLines={1}>{device.name}</Text>
        <Text style={styles.deviceRowUUID} numberOfLines={1}>{device.serviceUUID || 'No UUID set'}</Text>
      </View>
      {isActive && (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      )}
      <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
        <Trash2 size={16} color={Colors.red} />
      </Pressable>
    </Pressable>
  );
}

function AddDeviceModal({ visible, onClose, onAdd, form, setForm, selectedTemplate, setSelectedTemplate, onScan }: any) {
  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Add Device</Text>

          <Text style={styles.fieldLabel}>Template</Text>
          <View style={styles.templates}>
            {DEVICE_TEMPLATES.map((t, i) => (
              <Pressable
                key={t.name}
                style={[styles.templateBtn, selectedTemplate === i && { borderColor: Colors.neon, backgroundColor: Colors.neonDim }]}
                onPress={() => setSelectedTemplate(i)}
              >
                <t.Icon size={20} color={selectedTemplate === i ? Colors.neon : Colors.textMuted} />
                <Text style={[styles.templateText, selectedTemplate === i && { color: Colors.neon }]}>{t.name}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.scanFromModalBtn} onPress={onScan}>
            <Bluetooth size={14} color={Colors.accent} />
            <Text style={styles.scanFromModalText}>Scan for nearby devices</Text>
          </Pressable>

          <FormInput label="Device Name *" value={form.name} onChangeText={v => setForm((f: any) => ({ ...f, name: v }))} placeholder="My Casio ABL-100WE" />
          <FormInput label="Service UUID *" value={form.serviceUUID} onChangeText={v => setForm((f: any) => ({ ...f, serviceUUID: v }))} placeholder="00001804-0000-1000-8000-00805f9b34fb" mono />
          <FormInput label="Characteristic UUID" value={form.characteristicUUID} onChangeText={v => setForm((f: any) => ({ ...f, characteristicUUID: v }))} placeholder="00002a19-0000-1000-8000-00805f9b34fb" mono />
          <FormInput label="MAC Address (optional)" value={form.macAddress} onChangeText={v => setForm((f: any) => ({ ...f, macAddress: v }))} placeholder="AA:BB:CC:DD:EE:FF" mono />

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={onAdd}>
              <Text style={styles.confirmBtnText}>Add Device</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ScanModal({ visible, onClose, devices, scanning, onSelect }: any) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.scanHeader}>
            <Text style={styles.modalTitle}>Scanning...</Text>
            {scanning && <ActivityIndicator size="small" color={Colors.neon} />}
          </View>
          <Text style={styles.scanHint}>Make sure your watch is in pairing/discoverable mode</Text>

          <FlatList
            data={devices}
            keyExtractor={item => item.id}
            style={{ maxHeight: 300 }}
            ListEmptyComponent={
              <View style={styles.scanEmpty}>
                <Text style={styles.scanEmptyText}>{scanning ? 'Looking for devices...' : 'No devices found'}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.scannedItem, pressed && { opacity: 0.7 }]}
                onPress={() => onSelect(item)}
              >
                <Watch size={20} color={Colors.neon} />
                <View style={styles.scannedInfo}>
                  <Text style={styles.scannedName}>{item.name ?? 'Unknown Device'}</Text>
                  <Text style={styles.scannedId}>{item.id}</Text>
                </View>
                <ChevronRight size={16} color={Colors.textMuted} />
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function FormInput({ label, value, onChangeText, placeholder, mono = false }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; mono?: boolean;
}) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, mono && styles.inputMono]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 26, color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  scanBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.accentDim, borderWidth: 1, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.neon,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.neon, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10,
  },
  bleInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.amberDim, borderRadius: 10, padding: 12 },
  bleInfoText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.amber },
  infoCard: { padding: 14 },
  infoRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  emptyState: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: Colors.textSecondary },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  emptyAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.neon, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20,
    shadowColor: Colors.neon, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8,
  },
  emptyAddBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.bg },
  deviceList: { gap: 10 },
  deviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  deviceRowInfo: { flex: 1 },
  deviceRowName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  deviceRowUUID: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  activeBadge: { backgroundColor: Colors.neonDim, borderWidth: 1, borderColor: Colors.neonBorder, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  activeBadgeText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: Colors.neon },
  removeBtn: { padding: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 4 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: Colors.textPrimary, letterSpacing: -0.3 },
  templates: { flexDirection: 'row', gap: 8 },
  templateBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 12,
  },
  templateText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.textMuted, flex: 1 },
  scanFromModalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.accentDim, borderWidth: 1, borderColor: Colors.accent,
    borderRadius: 10, padding: 10, justifyContent: 'center',
  },
  scanFromModalText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.accent },
  formGroup: { gap: 4 },
  fieldLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 12, color: Colors.textPrimary,
    fontFamily: 'Inter_400Regular', fontSize: 14,
  },
  inputMono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.textSecondary },
  confirmBtn: {
    flex: 2, backgroundColor: Colors.neon, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    shadowColor: Colors.neon, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8,
  },
  confirmBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.bg },
  scanHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scanHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted },
  scanEmpty: { padding: 32, alignItems: 'center' },
  scanEmptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted },
  scannedItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgElevated, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    padding: 14, marginBottom: 8,
  },
  scannedInfo: { flex: 1 },
  scannedName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.textPrimary },
  scannedId: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textMuted, marginTop: 2 },
});
