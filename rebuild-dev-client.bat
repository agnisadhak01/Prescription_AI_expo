@echo off
echo ===== Rebuilding Development Client for Google SSO Fix =====
echo.
echo Step 1: Cleaning previous builds and cache
rmdir /s /q android\build
rmdir /s /q android\.gradle
npx expo prebuild --clean
echo.

echo Step 2: Directly building the development client with EAS
echo Building development client... This may take several minutes.
eas build --profile development-local --platform android --local
echo.

echo Step 3: Installing the development client
echo Please install the generated APK file to test the Google Sign-In fix.
echo.

echo Done! Google SSO should now work correctly.
echo If you still encounter issues, please check the logs for more information.
echo. 