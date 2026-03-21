import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import { mmkvStorage } from "./mmkvStorage";
import authReducer from "./slices/authSlice";
import deviceReducer from "./slices/deviceSlice";
import healthReducer from "./slices/healthSlice";
import settingsReducer from "./slices/settingsSlice";

const persistConfig = {
  key: "root",
  storage: mmkvStorage,
  whitelist: ["auth", "health", "settings", "device"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  device: deviceReducer,
  health: healthReducer,
  settings: settingsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
