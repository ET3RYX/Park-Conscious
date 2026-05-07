# Admin Mobile App Guide

This guide contains everything you need to manage the mobile version (iOS/Android) of the Admin Panel.

## 🚀 Important Commands

### 1. Daily Development
Every time you change your React code and want to see it on your phone:
```bash
npm run build         # Build the web project
npm run cap:sync      # Sync the build to iOS and Android
```

### 2. Opening Projects
Open the native projects in their respective IDEs:
```bash
npm run cap:ios       # Opens Xcode
npm run cap:android   # Opens Android Studio
```

---

## 🔐 Biometric Login (FaceID / Fingerprint)
The app is configured to use biometrics.
- **Plugin used**: `capacitor-native-biometric`
- **Utility location**: `src/utils/biometrics.js`

---

## 🌐 Production API
The app is configured to connect to the **Live Backend** by default.
- **URL**: `https://admin.events.parkconscious.in`
- This means it works over 5G/LTE and does not require your Mac to be running.

---

## 📱 How to install on your iPhone (First Time)

### Prerequisites
1.  **A Mac** with **Xcode** installed.
2.  An **iPhone** and a USB-to-Lightning/USB-C cable.

### Steps
1.  **Connect your iPhone** to your Mac.
2.  Run `npm run cap:ios` to open Xcode.
3.  In Xcode, select your **iPhone** in the top device selector.
4.  Go to the **Signing & Capabilities** tab:
    - Click **+ Capability** and add **Biometric Authentication**.
    - Ensure a **Team** is selected (your personal Apple ID is fine).
5.  Click the **Play button (▶)** in the top left.
6.  **Trust the developer**: If you see an error on your phone saying "Untrusted Developer," go to:
    - `Settings` -> `General` -> `VPN & Device Management` -> `Your Apple ID` -> `Trust`.

---

## 🛠 Troubleshooting
- **White Screen**: Ensure `npm run build` was successful before running `npm run cap:sync`.
- **FaceID not working**: Ensure you have added the `NSFaceIDUsageDescription` to your `Info.plist` in Xcode (I have handled this in the configuration, but double-check if it fails).
