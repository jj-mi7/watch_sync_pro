import type { ConnectionStatus, DeviceInfo } from "@/types";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface DeviceState {
  device: DeviceInfo | null;
  connectionStatus: ConnectionStatus;
  syncLogs: Array<{ time: string; type: string; msg: string }>;
}

const initialState: DeviceState = {
  device: null,
  connectionStatus: "disconnected",
  syncLogs: [],
};

const deviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    setDevice(state, action: PayloadAction<DeviceInfo>) {
      state.device = action.payload;
    },
    setConnectionStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.connectionStatus = action.payload;
    },
    setWatchPhoto(state, action: PayloadAction<string>) {
      if (state.device) {
        state.device.photoUri = action.payload;
      }
    },
    setBatteryLevel(state, action: PayloadAction<number>) {
      if (state.device) {
        state.device.batteryLevel = action.payload;
      }
    },
    setLastSyncTime(state, action: PayloadAction<string>) {
      if (state.device) {
        state.device.lastSyncTime = action.payload;
      }
    },
    addSyncLog(state, action: PayloadAction<{ time: string; type: string; msg: string }>) {
      state.syncLogs = [...state.syncLogs.slice(-80), action.payload];
    },
    clearSyncLogs(state) {
      state.syncLogs = [];
    },
    clearDevice(state) {
      state.device = null;
      state.connectionStatus = "disconnected";
      state.syncLogs = [];
    },
  },
});

export const {
  setDevice,
  setConnectionStatus,
  setWatchPhoto,
  setBatteryLevel,
  setLastSyncTime,
  addSyncLog,
  clearSyncLogs,
  clearDevice,
} = deviceSlice.actions;
export default deviceSlice.reducer;
