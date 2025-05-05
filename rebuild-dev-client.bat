@echo off
echo ===== Rebuilding Development Client for Google SSO Fix =====
echo.
echo Step 1: Cleaning previous builds and cache
rmdir /s /q android\build
rmdir /s /q android\.gradle
npx expo prebuild --clean
echo.

echo Step 2: Building the development client with EAS Cloud Build
echo Building development client with new Google SSO credentials... This may take several minutes.
echo Using SHA-1: AB:F1:5B:E5:66:61:96:5D:06:66:77:FE:27:CD:07:09:36:6A:01:CD
echo Using Client ID: 232795038046-h8ti1bbf9dm30t2pvpt4sfur3pss2k5p.apps.googleusercontent.com
eas build --profile development --platform android
echo.

echo Step 3: Installing the development client
echo Please install the generated APK file from the EAS build dashboard.
echo You can view the build status by running: eas build:list
echo.

echo Important: After installation, test Google Sign-In again. The DEVELOPER_ERROR should be resolved.
echo If you still encounter issues, please check the logs for more information.
echo. 