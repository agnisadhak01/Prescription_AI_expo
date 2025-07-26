@echo off
REM Prescription AI - Pixel 8a Emulator Launcher (Batch Version)
REM This script launches the Pixel 8a Android Virtual Device (AVD)

echo Starting Pixel 8a Emulator...

REM Define the path to the Android SDK emulator
set "EMULATOR_PATH=%USERPROFILE%\AppData\Local\Android\Sdk\emulator\emulator.exe"

REM Check if emulator exists
if not exist "%EMULATOR_PATH%" (
    echo Error: Android SDK emulator not found at: %EMULATOR_PATH%
    echo Please ensure Android SDK is properly installed.
    pause
    exit /b 1
)

REM Check if emulator is already running
echo Checking if emulator is already running...
set "ADB_PATH=%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe"

if exist "%ADB_PATH%" (
    "%ADB_PATH%" devices > temp_devices.txt 2>nul
    type temp_devices.txt | find "emulator-" >nul 2>&1
    if not errorlevel 1 (
        echo Emulator is already running!
        type temp_devices.txt | find "emulator-"
        echo.
        set /p "CONTINUE=Do you want to start another instance? (y/N): "
        if /i not "%CONTINUE%"=="y" (
            del temp_devices.txt >nul 2>&1
            echo Emulator launch cancelled.
            pause
            exit /b 0
        )
    )
    del temp_devices.txt >nul 2>&1
)

REM Get available AVDs
echo Launching Pixel 8a emulator...
echo This may take a few minutes on first launch...

REM List AVDs and try to find Pixel 8a
"%EMULATOR_PATH%" -list-avds > temp_avds.txt 2>nul

REM Try to find any Pixel 8a variant
type temp_avds.txt | find /i "pixel" | find /i "8a" >nul 2>&1
if not errorlevel 1 (
    REM Found a Pixel 8a AVD, get the first one
    for /f "tokens=*" %%i in ('type temp_avds.txt ^| find /i "pixel"') do (
        echo %%i | find /i "8a" >nul 2>&1
        if not errorlevel 1 (
            set "AVD_NAME=%%i"
            goto :found_avd
        )
    )
)

REM Try exact names
for %%n in (Pixel_8a pixel-8a Pixel8a pixel_8a) do (
    type temp_avds.txt | find "%%n" >nul 2>&1
    if not errorlevel 1 (
        set "AVD_NAME=%%n"
        goto :found_avd
    )
)

REM No Pixel 8a found
echo Error: No Pixel 8a AVD found.
echo Available AVDs:
type temp_avds.txt
echo.
echo Please create a Pixel 8a AVD in Android Studio:
echo 1. Open Android Studio
echo 2. Go to Tools → AVD Manager
echo 3. Click 'Create Virtual Device'
echo 4. Select 'Pixel 8a' and follow the setup
del temp_avds.txt >nul 2>&1
pause
exit /b 1

:found_avd
del temp_avds.txt >nul 2>&1
echo Starting AVD: %AVD_NAME%
start "" "%EMULATOR_PATH%" -avd "%AVD_NAME%"

echo Pixel 8a emulator started successfully!
echo The emulator window should appear shortly.
echo You can now run 'npx expo start' and press 'a' to deploy your app.
echo.
pause 