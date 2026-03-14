# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── bandbridge/         # Expo React Native BLE smartwatch app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## BandBridge App (artifacts/bandbridge)

Expo React Native app for connecting Casio ABL-100WE and other BLE smartbands.

### Features
- Dark neo/cyberpunk theme (Colors: #050508 bg, #00F5C4 neon, #7B5EFF accent)
- Bluetooth BLE scanning & pairing via `react-native-ble-plx`
- Manual UUID entry for Casio ABL-100WE and any custom device
- Dashboard: steps, calories, km, daily goal progress
- Charts via `react-native-chart-kit` (Logs tab)
- MMKV-speed storage via AsyncStorage
- Photo upload for watch images (expo-image-picker)
- Sync button + find-phone feature
- 4-tab navigation: Dashboard, Logs, Devices, Settings
- Scalable device architecture for other smartbands
- Biome formatting ready

### Key Files
- `app/_layout.tsx` - Root layout with AppProvider + BleProvider
- `context/AppContext.tsx` - App state (devices, stats, goals)
- `context/BleContext.tsx` - BLE manager (react-native-ble-plx)
- `app/(tabs)/index.tsx` - Dashboard
- `app/(tabs)/logs.tsx` - Activity logs + charts
- `app/(tabs)/devices.tsx` - BLE device management
- `app/(tabs)/settings.tsx` - Goals, profile, how-to guide
- `constants/colors.ts` - Dark neo theme palette

### Connecting Casio ABL-100WE
1. Enable pairing mode on watch (hold lower-left button)
2. Use NRF Connect app to find UUIDs
3. Add device in Devices tab with UUIDs
4. Tap Connect

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/`.
