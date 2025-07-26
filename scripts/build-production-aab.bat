@echo off
echo ========================================
echo Building Production AAB for Prescription AI
echo ========================================
echo.

echo Checking EAS CLI version...
npx eas --version
if %errorlevel% neq 0 (
    echo Error: EAS CLI not found. Installing...
    npm install -g @expo/eas-cli
)

echo.
echo Checking EAS login status...
npx eas whoami
if %errorlevel% neq 0 (
    echo Please login to EAS first:
    echo npx eas login
    pause
    exit /b 1
)

echo.
echo Starting production AAB build...
echo This will take 10-20 minutes...
echo.

npx eas build --platform android --profile production --clear-cache

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Build completed successfully!
    echo Check your EAS dashboard for the AAB file.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Build failed! Check the error messages above.
    echo ========================================
)

pause 