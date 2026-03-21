import { MMKV } from "react-native-mmkv";
import type { Storage } from "redux-persist";

export const mmkv = new MMKV({
  id: "watchsync-pro-storage",
  encryptionKey: "watchsync-secure-key",
});

export const mmkvStorage: Storage = {
  setItem: (key: string, value: string) => {
    mmkv.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = mmkv.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key: string) => {
    mmkv.delete(key);
    return Promise.resolve();
  },
};
