import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { Platform, Vibration } from 'react-native';
import { type BleStatus, type BleDevice, type WatchData, isMockMode, generateMockData } from '@/lib/bluetooth';

interface BleContextValue {
  status: BleStatus;
  connectedDevice: BleDevice | null;
  scannedDevices: BleDevice[];
  watchData: WatchData | null;
  battery: number | null;
  isScanning: boolean;
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectTo: (device: BleDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  syncData: () => Promise<WatchData | null>;
  triggerFindPhone: () => Promise<void>;
}

const BleContext = createContext<BleContextValue | null>(null);

export function BleProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BleStatus>('idle');
  const [connectedDevice, setConnectedDevice] = useState<BleDevice | null>(null);
  const [scannedDevices, setScannedDevices] = useState<BleDevice[]>([]);
  const [watchData, setWatchData] = useState<WatchData | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScan = useCallback(async () => {
    if (isMockMode()) {
      setIsScanning(true);
      setStatus('scanning');
      setScannedDevices([]);
      setTimeout(() => {
        setScannedDevices([
          { id: 'mock-other-001', name: 'Smart Band Pro', rssi: -78 },
        ]);
      }, 1200);
      setTimeout(() => {
        setScannedDevices(prev => [...prev, { id: 'mock-other-002', name: 'Fitbit Charge 5', rssi: -85 }]);
      }, 2500);
      setTimeout(() => {
        setScannedDevices(prev => [...prev, { id: 'mock-casio-001', name: 'Casio ABL-100WE', rssi: -62 }]);
        setIsScanning(false);
        setStatus('idle');
      }, 4000);
      return;
    }

    try {
      const { scanForDevices } = await import('@/lib/bluetooth');
      const { storage } = await import('@/lib/storage');
      const uuids = await storage.getBleUuids();
      setIsScanning(true);
      setStatus('scanning');
      setScannedDevices([]);
      await scanForDevices(
        device => {
          setScannedDevices(prev => {
            if (prev.find(d => d.id === device.id)) return prev;
            return [...prev, device];
          });
        },
        [uuids.serviceUuid],
        12000,
      );
    } catch {
      setStatus('error');
    } finally {
      setIsScanning(false);
      setStatus(s => s === 'scanning' ? 'idle' : s);
    }
  }, []);

  const stopScan = useCallback(async () => {
    if (!isMockMode()) {
      const { stopScan: stop } = await import('@/lib/bluetooth');
      await stop();
    }
    setIsScanning(false);
    setStatus('idle');
  }, []);

  const connectTo = useCallback(async (device: BleDevice) => {
    setStatus('connecting');
    if (isMockMode()) {
      await new Promise(r => setTimeout(r, 1200));
      setConnectedDevice(device);
      setStatus('connected');
      setWatchData(generateMockData());
      setBattery(85);
      return;
    }
    try {
      const { connectToDevice } = await import('@/lib/bluetooth');
      const ok = await connectToDevice(device.id);
      if (ok) { setConnectedDevice(device); setStatus('connected'); }
      else setStatus('error');
    } catch { setStatus('error'); }
  }, []);

  const disconnect = useCallback(async () => {
    if (!isMockMode() && connectedDevice) {
      const { disconnectDevice } = await import('@/lib/bluetooth');
      await disconnectDevice(connectedDevice.id);
    }
    setConnectedDevice(null);
    setStatus('disconnected');
    setWatchData(null);
    setBattery(null);
  }, [connectedDevice]);

  const syncData = useCallback(async (): Promise<WatchData | null> => {
    if (isMockMode()) {
      const data = generateMockData();
      setWatchData(data);
      setBattery(85);
      return data;
    }
    if (!connectedDevice) return null;
    try {
      const { readWatchData } = await import('@/lib/bluetooth');
      const { storage } = await import('@/lib/storage');
      const uuids = await storage.getBleUuids();
      const data = await readWatchData(connectedDevice.id, uuids);
      setWatchData(data);
      if (data.battery != null) setBattery(data.battery);
      return data;
    } catch { return null; }
  }, [connectedDevice]);

  const triggerFindPhone = useCallback(async () => {
    Vibration.vibrate([0, 200, 100, 200]);
    if (isMockMode() || !connectedDevice) return;
    try {
      const { triggerFindPhone: doFind } = await import('@/lib/bluetooth');
      const { storage } = await import('@/lib/storage');
      const uuids = await storage.getBleUuids();
      await doFind(connectedDevice.id, uuids.serviceUuid, uuids.findPhoneCharUuid);
    } catch {}
  }, [connectedDevice]);

  const value = useMemo(() => ({
    status, connectedDevice, scannedDevices, watchData, battery, isScanning,
    startScan, stopScan, connectTo, disconnect, syncData, triggerFindPhone,
  }), [status, connectedDevice, scannedDevices, watchData, battery, isScanning,
    startScan, stopScan, connectTo, disconnect, syncData, triggerFindPhone]);

  return <BleContext.Provider value={value}>{children}</BleContext.Provider>;
}

export function useBle(): BleContextValue {
  const ctx = useContext(BleContext);
  if (!ctx) throw new Error('useBle must be used within BleProvider');
  return ctx;
}
