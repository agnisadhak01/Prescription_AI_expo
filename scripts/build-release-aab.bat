@echo off
setlocal enabledelayedexpansion

echo.
echo 🚀 Building Release AAB for Play Store Upload...
echo Version: 1.0.2 (Code: 8)
echo.

REM Check if we're in the correct directory
if not exist "android\app\build.gradle" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check if release keystore exists
if not exist "android\app\release.keystore" (
    echo ❌ Error: Release keystore not found at android\app\release.keystore
    echo Please ensure the keystore is properly copied from keystore-details/
    pause
    exit /b 1
)

REM Clean previous build
echo 🧹 Cleaning previous build...
cd android
call gradlew clean
if errorlevel 1 (
    echo ❌ Error during clean
    cd ..
    pause
    exit /b 1
)
echo ✅ Clean completed successfully

REM Build release AAB
echo 📦 Building release AAB...
call gradlew bundleRelease
if errorlevel 1 (
    echo ❌ Error during build
    cd ..
    pause
    exit /b 1
)
echo ✅ Release AAB built successfully!

REM Check if AAB was created
set "aabPath=app\build\outputs\bundle\release\app-release.aab"
if exist "%aabPath%" (
    echo 📱 AAB created successfully!
    echo    Path: android\%aabPath%
    
    REM Copy to root directory for easy access
    copy "%aabPath%" "..\app-release-v1.0.2.aab" >nul
    echo    Copied to: app-release-v1.0.2.aab
    
    echo.
    echo 🎉 SUCCESS! Your release AAB is ready for Play Store upload!
    echo.
    echo Next steps:
    echo 1. Upload app-release-v1.0.2.aab to Google Play Console
    echo 2. The AAB is signed with your production certificate
    echo 3. Google SSO should work correctly with this build
    echo.
    echo Certificate fingerprint: 8F:0F:16:03:35:E1:EA:51:29:6F:64:FF:FE:8F:4B:24:C9:5D:64:5F
    
) else (
    echo ❌ Error: AAB file not found at expected location
    cd ..
    pause
    exit /b 1
)

cd ..
echo ✅ Build script completed successfully!
pause 