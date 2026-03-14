import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type BleState = 'Unknown' | 'Resetting' | 'Unsupported' | 'Unauthorized' | 'PoweredOff' | 'PoweredOn';

interface ScannedDevice {
  id: string;
  name: string | null;
}

interface BleContextType {
  bleState: BleState;
  scannedDevices: ScannedDevice[];
  isScanning: boolean;
  connectedDeviceId: string | null;
  connectedDevice: { id: string } | null;
  startScan: () => void;
  stopScan: () => void;
  connectToDevice: (deviceId: string, serviceUUID: string, characteristicUUID: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  findPhone: () => Promise<void>;
  bleError: string | null;
  clearError: () => void;
}

const BleContext = createContext<BleContextType | null>(null);

export function BleProvider({ children }: { children: React.ReactNode }) {
  const [bleState, setBleState] = useState<BleState>('Unknown');
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
  const [bleError, setBleError] = useState<string | null>(null);
  const managerRef = useRef<any>(null);
  const connectedRef = useRef<any>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setBleState('Unsupported');
      return;
    }

    let sub: any = null;
    try {
      const { BleManager } = require('react-native-ble-plx');
      const m = new BleManager();
      managerRef.current = m;
      sub = m.onStateChange((state: string) => {
        setBleState(state as BleState);
      }, true);
    } catch (e: any) {
      setBleError('BLE not available in Expo Go. Use a development build for Bluetooth.');
      setBleState('Unsupported');
    }

    return () => {
      sub?.remove?.();
      try { managerRef.current?.destroy?.(); } catch (_) {}
    };
  }, []);

  const clearError = useCallback(() => setBleError(null), []);

  const startScan = useCallback(() => {
    const m = managerRef.current;
    if (!m) {
      setBleError(Platform.OS === 'web'
        ? 'Bluetooth scanning is not supported on web.'
        : 'BLE not available in Expo Go. Use a development build for Bluetooth.');
      return;
    }
    if (bleState !== 'PoweredOn') {
      setBleError('Please enable Bluetooth on your device.');
      return;
    }
    setScannedDevices([]);
    setIsScanning(true);
    setBleError(null);

    try {
      m.startDeviceScan(null, { allowDuplicates: false }, (error: any, device: any) => {
        if (error) {
          setBleError(error.message);
          setIsScanning(false);
          return;
        }
        if (device?.name) {
          setScannedDevices(prev => {
            if (prev.find(d => d.id === device.id)) return prev;
            return [...prev, { id: device.id, name: device.name }];
          });
        }
      });

      scanTimeoutRef.current = setTimeout(() => {
        m.stopDeviceScan();
        setIsScanning(false);
      }, 15000);
    } catch (e: any) {
      setBleError(e.message ?? 'Failed to start scan');
      setIsScanning(false);
    }
  }, [bleState]);

  const stopScan = useCallback(() => {
    try { managerRef.current?.stopDeviceScan?.(); } catch (_) {}
    setIsScanning(false);
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
  }, []);

  const connectToDevice = useCallback(async (deviceId: string, serviceUUID: string, _charUUID: string): Promise<boolean> => {
    const m = managerRef.current;
    if (!m) {
      setBleError(Platform.OS === 'web'
        ? 'Bluetooth not supported on web.'
        : 'BLE not available in Expo Go. Use a development build to connect.');
      return false;
    }
    try {
      stopScan();
      const device = await m.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      connectedRef.current = device;
      setConnectedDeviceId(deviceId);
      setBleError(null);
      return true;
    } catch (e: any) {
      setBleError(e.message ?? 'Failed to connect');
      return false;
    }
  }, [stopScan]);

  const disconnect = useCallback(async () => {
    if (connectedRef.current) {
      try { await connectedRef.current.cancelConnection(); } catch (_) {}
      connectedRef.current = null;
      setConnectedDeviceId(null);
    }
  }, []);

  const findPhone = useCallback(async () => {
    if (!connectedDeviceId) {
      setBleError('No device connected');
      return;
    }
    setBleError(null);
  }, [connectedDeviceId]);

  const connectedDevice = connectedDeviceId ? { id: connectedDeviceId } : null;

  return (
    <BleContext.Provider value={{
      bleState, scannedDevices, isScanning,
      connectedDeviceId, connectedDevice,
      startScan, stopScan, connectToDevice, disconnect,
      findPhone, bleError, clearError,
    }}>
      {children}
    </BleContext.Provider>
  );
}

export function useBle() {
  const ctx = useContext(BleContext);
  if (!ctx) throw new Error('useBle must be used within BleProvider');
  return ctx;
}
