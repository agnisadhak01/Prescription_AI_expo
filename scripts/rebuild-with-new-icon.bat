@echo off
setlocal enabledelayedexpansion

REM Rebuild App with New Icon Script
REM This script rebuilds the app after icon changes

echo 🎨 Rebuilding App with New Icon...
echo 📱 Icon files to be updated:
echo    - icon.png
echo    - adaptive-icon.png

REM Check if we're in the correct directory
if not exist "app.json" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

REM Check if icon files exist
set "iconPath=assets\images\icon.png"
set "adaptiveIconPath=assets\images\adaptive-icon.png"

if not exist "!iconPath!" (
    echo ❌ Error: icon.png not found at !iconPath!
    exit /b 1
)

if not exist "!adaptiveIconPath!" (
    echo ❌ Error: adaptive-icon.png not found at !adaptiveIconPath!
    exit /b 1
)

echo ✅ Icon files found

REM Stop any running Metro server
echo 🛑 Stopping Metro server if running...
taskkill /f /im node.exe >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Metro server stopped
) else (
    echo ℹ️  No Metro server running
)

REM Clean Expo cache
echo 🧹 Cleaning Expo cache...
npx expo start --clear >nul 2>&1
timeout /t 3 >nul
taskkill /f /im node.exe >nul 2>&1
echo ✅ Expo cache cleared

REM Clean and rebuild native code
echo 🔨 Cleaning native code...
npx expo prebuild --clean
if !errorlevel! neq 0 (
    echo ❌ Error during prebuild
    exit /b 1
)
echo ✅ Native code cleaned

REM Rebuild Android app
echo 📦 Rebuilding Android app...
npx expo run:android
if !errorlevel! neq 0 (
    echo ❌ Error during Android build
    echo.
    echo 💡 Alternative: Try building APK directly:
    echo    build-test-apk.bat
    exit /b 1
)
echo ✅ Android app rebuilt successfully!

echo.
echo 🎉 SUCCESS! App rebuilt with new icon!
echo.
echo 📋 Next steps:
echo 1. Check the app icon on your device/emulator
echo 2. If icon still shows old version, try:
echo    - Uninstall and reinstall the app
echo    - Clear app cache on device
echo    - Restart the device/emulator
echo.
echo 🔧 If issues persist, try building APK:
echo    build-test-apk.bat 