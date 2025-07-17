@echo off
setlocal enabledelayedexpansion

REM Build Test APK Script for Local Testing
REM This script builds a test APK for testing the webhook changes

echo 🚀 Building Test APK for Local Testing...
echo 📡 Using webhook: https://n8n.ausomemgr.com/webhook/prescription-multi-ocr

REM Check if we're in the correct directory
if not exist "android\app\build.gradle" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

echo 🔑 Using debug keystore for testing...

REM Clean previous build
echo 🧹 Cleaning previous build...
cd android
call gradlew clean
if !errorlevel! neq 0 (
    echo ❌ Error during clean
    cd ..
    exit /b 1
)
echo ✅ Clean completed successfully

REM Build debug APK
echo 📦 Building debug APK...
call gradlew assembleDebug
if !errorlevel! neq 0 (
    echo ❌ Error during build
    cd ..
    exit /b 1
)
echo ✅ Debug APK built successfully!

REM Check if APK was created
set "apkPath=app\build\outputs\apk\debug\app-debug.apk"
if exist "!apkPath!" (
    for %%A in ("!apkPath!") do set "apkSize=%%~zA"
    set /a "apkSizeMB=!apkSize!/1048576"
    echo 📱 APK created successfully!
    echo    Path: android\!apkPath!
    echo    Size: !apkSizeMB! MB
    
    REM Copy to root directory for easy access
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set "mydate=%%c%%a%%b"
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do set "mytime=%%a%%b"
    set "timestamp=!mydate!-!mytime!"
    set "rootApkPath=..\test-apk-multi-ocr-!timestamp!.apk"
    copy "!apkPath!" "!rootApkPath!" >nul
    echo    Copied to: test-apk-multi-ocr-!timestamp!.apk
    
    echo.
    echo 🎉 SUCCESS! Your test APK is ready!
    echo.
    echo 📋 Testing checklist:
    echo 1. Install APK on device: adb install test-apk-multi-ocr-!timestamp!.apk
    echo 2. Test prescription scanning with new webhook endpoint
    echo 3. Verify OCR processing works with multi-ocr endpoint
    echo 4. Check scan quota deduction after successful processing
    echo.
    echo 📡 Webhook endpoint: https://n8n.ausomemgr.com/webhook/prescription-multi-ocr
    echo 🔧 This is a debug build - for testing only, not for production
    
) else (
    echo ❌ Error: APK file not found at expected location
    cd ..
    exit /b 1
)

cd ..
echo ✅ Build script completed successfully! 