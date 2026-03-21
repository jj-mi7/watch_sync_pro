# Build Commands Workflow

This workflow provides the necessary commands and steps to generate APK (Android) and IPA (iOS) builds for your React Native application.

## Android Build (APK / AAB)

**Keystore Status**: ✅ A `debug.keystore` is already present inside `android/app/` in this project. Both debug and release builds are currently configured to use this debug keystore in `android/app/build.gradle`.

> **Note:** Before publishing to the Google Play Store, you must generate a **production keystore** and update the `release` signing config in `android/app/build.gradle`.

### Generate a Debug APK
This will build a debug version of the app (great for testing locally without a dev server).

```bash
cd android && ./gradlew assembleDebug
```
*The resulting APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`*

### Generate a Release APK
This will build a release version of the app (optimized, but still using the debug keystore for now).

```bash
cd android && ./gradlew assembleRelease
```
*The resulting APK will be located at: `android/app/build/outputs/apk/release/app-release.apk`*

### Generate a Release AAB (Android App Bundle)
If you want to upload to the Google Play Store (once you have a production keystore configured).

```bash
cd android && ./gradlew bundleRelease
```
*The resulting AAB will be located at: `android/app/build/outputs/bundle/release/app-release.aab`*

---

## iOS Build (IPA)

To build an IPA for iOS, you generally use **Xcode** or **Fastlane**. Here is the standard way using Xcode and command line tools.

> **Note:** Building for iOS requires a Mac with Xcode installed, and an active Apple Developer account if you want to install it on a physical device.

### Preparation

1. Open the iOS project in Xcode:
   ```bash
   open ios/MyApp.xcworkspace
   ```
2. In Xcode, ensure your **Signing & Capabilities** are set up with your Apple Developer account/team.

### Option 1: Using Xcode (Recommended for visual ease)

1. Select **Any iOS Device (arm64)** or your connected physical device as the run destination.
2. Go to **Product > Archive** from the menu bar.
3. Once the archive finishes building, the Organizer window will pop up.
4. Click **Distribute App** and follow the prompts (e.g., Development, Ad Hoc, or App Store Connect) to export the `.ipa` file.

### Option 2: Using Command Line (xcodebuild)

If you prefer the terminal, you can create an archive and export it, though you will need an `exportOptions.plist` file configured with your provisioning profile details.

```bash
cd ios
# 1. Archive the build
xcodebuild -workspace MyApp.xcworkspace -scheme MyApp -configuration Release -sdk iphoneos -archivePath ./build/MyApp.xcarchive archive

# 2. Export the IPA (replace ExportOptions.plist with your actual config file)
xcodebuild -exportArchive -archivePath ./build/MyApp.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath ./build/
```

*The resulting `.ipa` file will be deposited in the `ios/build/` directory.*
