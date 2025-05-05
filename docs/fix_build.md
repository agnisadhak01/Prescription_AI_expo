# Android Local Build Fixes

This document outlines the steps required to successfully build an Android development client APK locally.

## Prerequisites

- Android Studio installed
- Android SDK installed (usually at `C:\Users\<username>\AppData\Local\Android\Sdk` on Windows)
- Node.js and npm installed
- Expo CLI installed

## Issues and Solutions

### 1. Android SDK Path Configuration

The first issue encountered was the Android SDK path not being correctly set. To fix this:

1. Create or update the `android/local.properties` file with the correct SDK path:
```
sdk.dir=C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk
```

2. Set the ANDROID_HOME environment variable:
```powershell
$env:ANDROID_HOME = "C:\Users\<username>\AppData\Local\Android\Sdk"
```

### 2. Expo Module Gradle Plugin Issues

The build failed due to missing or incompatible Expo module Gradle plugins:

1. Modified `node_modules/expo-secure-store/android/build.gradle`:
```gradle
plugins {
  id 'com.android.library'
  id 'kotlin-android'
}

apply from: '../../expo-modules-core/android/ExpoModulesCorePlugin.gradle'
applyKotlinExpoModulesCorePlugin()
useDefaultAndroidSdkVersions()
useCoreDependencies()
```

2. Updated `node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle` to use debug variant instead of release:
```gradle
ext.useExpoPublishing = {
  if (!project.plugins.hasPlugin('maven-publish')) {
    apply plugin: 'maven-publish'
  }

  project.android {
    publishing {
      singleVariant("debug") {
        withSourcesJar()
      }
    }
  }

  project.afterEvaluate {
    publishing {
      publications {
        debug(MavenPublication) {
          from components.debug
        }
      }
      repositories {
        maven {
          url = mavenLocal().url
        }
      }
    }
  }
}
```

### 3. Build Configuration for Local Development

Added a `development-local` profile in `eas.json`:
```json
"development-local": {
  "developmentClient": true,
  "distribution": "internal",
  "android": {
    "buildType": "apk",
    "gradleCommand": ":app:assembleDebug"
  },
  "env": {
    "ANDROID_HOME": "C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk"
  }
}
```

## Build Commands

Follow these steps to build the development client APK:

1. Clean the project and reinstall dependencies:
```bash
npm install
npx expo prebuild --clean
```

2. Set the correct Android SDK path:
```powershell
Set-Content -Path "android/local.properties" -Value "sdk.dir=C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk"
```

3. Build the debug APK:
```bash
$env:ANDROID_HOME = "C:\Users\<username>\AppData\Local\Android\Sdk"
npx expo run:android
```

## APK Location

After successful build, the debug APK can be found at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Installation

When installing on a device that already has the app installed with a different signature, you might see:
```
INSTALL_FAILED_UPDATE_INCOMPATIBLE: Existing package signatures do not match newer version
```

To resolve this:
1. Uninstall the existing app from the device
2. Install the debug APK using adb:
```bash
adb install -r "path/to/app-debug.apk"
```

## Troubleshooting

If you encounter issues with Expo modules:
1. Check the module's build.gradle file for any reference to custom plugins
2. Ensure all paths in the build.gradle files are correct
3. Look for missing dependencies in the node_modules folder
4. Check for version mismatches between React Native, Expo, and their dependencies

## Workaround for Windows Path Issues

If you encounter issues with long paths or copy failures (often showing as "Hard link failed" errors), consider:
1. Enable long path support in Windows
2. Move the project to a shorter path (e.g., C:\Projects instead of deeper nested directories)
3. Use EAS cloud builds as an alternative to local builds 