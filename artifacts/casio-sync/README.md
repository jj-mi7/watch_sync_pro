# CasioSync

Pure React Native app for connecting your Casio ABL-100WE (and other smartbands) via Bluetooth BLE.

## Features

- **BLE Connectivity** — via `react-native-ble-plx` (UUID manual entry + auto-scan)
- **Step tracker, Calories, KM walked**
- **Sync Button** with animations
- **Dark Neo theme** (black/cyan/purple)
- **Dashboard** with animated rings and progress bars
- **7-day charts** — steps, calories, distance
- **Daily goal setter**
- **Photo upload** for watch
- **Google Sign-In** authentication
- **MMKV** for ultra-fast local storage
- **Biome** for formatting
- **Scalable architecture** — add more smartbands easily

---

## How to Build (Android APK / Bundle)

### Prerequisites

- Node.js 18+
- JDK 17
- Android Studio + SDK (API 34)
- `ANDROID_HOME` env var set

### Setup

```bash
# Install JS dependencies
npm install

# Android debug APK
cd android && ./gradlew assembleDebug

# Android release bundle (for Play Store)
cd android && ./gradlew bundleRelease

# Android release APK (direct install)
cd android && ./gradlew assembleRelease
```

The APK will be at:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### Release Keystore (required for `assembleRelease`)

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/release.keystore \
  -alias casiosync \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Then update android/gradle.properties:
MYAPP_UPLOAD_STORE_FILE=release.keystore
MYAPP_UPLOAD_KEY_ALIAS=casiosync
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

---

## How to Build (iOS)

### Prerequisites

- macOS with Xcode 15+
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer account

### Setup

```bash
npm install
cd ios && pod install && cd ..

# Run on simulator
npx react-native run-ios

# Build Archive (for App Store)
# Open ios/CasioSync.xcworkspace in Xcode
# Product → Archive → Distribute
```

---

## Connecting Your Casio ABL-100WE

### Using nRF Connect (find your UUIDs)

1. **Install nRF Connect** from App Store / Play Store
2. Open nRF Connect → Scan → find "ABL-100WE" or "Casio"
3. Tap **Connect**
4. Go to **Services** tab
5. Look for a service with readable characteristics
6. **Long tap** the Service UUID → Copy
7. Tap the service → find a Characteristic with **READ** or **NOTIFY**
8. **Long tap** the Characteristic UUID → Copy
9. Paste both into CasioSync → Device screen

### Common Casio/Sports BLE UUIDs to try:

| Service | UUID |
|---------|------|
| Heart Rate | `0000180d-0000-1000-8000-00805f9b34fb` |
| Generic Access | `00001800-0000-1000-8000-00805f9b34fb` |
| Device Info | `0000180a-0000-1000-8000-00805f9b34fb` |
| Custom Casio | Found via nRF Connect |

---

## Google Sign-In Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable Google Sign-In API
3. Create OAuth 2.0 credentials (Web + Android + iOS)
4. Copy the **Web Client ID** to `src/services/AuthService.ts`:
   ```ts
   webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',
   ```
5. For Android: place `google-services.json` in `android/app/`
6. For iOS: place `GoogleService-Info.plist` in `ios/CasioSync/`

---

## Adding More Smartbands

Edit `src/screens/DeviceScreen.tsx` → `WATCH_PRESETS` array:

```ts
const WATCH_PRESETS = [
  { brand: 'Casio', model: 'ABL-100WE', name: 'Casio ABL-100WE' },
  // Add yours:
  { brand: 'Fitbit', model: 'Charge 6', name: 'Fitbit Charge 6' },
];
```

Then implement parsing in `src/services/BleService.ts` → `parseActivityData()`.

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| `react-native-ble-plx` | Bluetooth BLE |
| `react-native-mmkv` | Ultra-fast local storage |
| `react-native-chart-kit` | Graphs & charts |
| `zustand` | State management |
| `@react-navigation` | Navigation |
| `react-native-image-picker` | Watch photo upload |
| `@react-native-google-signin` | Authentication |
| `@biomejs/biome` | Linting & formatting |
| `react-native-reanimated` | Smooth animations |

---

## Format Code

```bash
npm run format    # format all files
npm run lint      # check issues
npm run check     # lint + format in one
```
