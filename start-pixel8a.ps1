#!/usr/bin/env powershell

# Prescription AI - Pixel 8a Emulator Launcher
# This script launches the Pixel 8a Android Virtual Device (AVD)

Write-Host "Starting Pixel 8a Emulator..." -ForegroundColor Green

# Define the path to the Android SDK emulator
$EmulatorPath = "$env:USERPROFILE\AppData\Local\Android\Sdk\emulator\emulator.exe"

# Check if emulator exists
if (-not (Test-Path $EmulatorPath)) {
    Write-Host "Error: Android SDK emulator not found at: $EmulatorPath" -ForegroundColor Red
    Write-Host "Please ensure Android SDK is properly installed." -ForegroundColor Yellow
    exit 1
}

# Check if Pixel 8a AVD exists
Write-Host "Checking available AVDs..." -ForegroundColor Yellow
$AvdList = & $EmulatorPath -list-avds 2>$null

if ($AvdList -notcontains "Pixel_8a") {
    Write-Host "Available AVDs:" -ForegroundColor Yellow
    $AvdList | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }
    
    # Try common variations of Pixel 8a names
    $PossibleNames = @("Pixel_8a", "pixel-8a", "Pixel8a", "pixel_8a")
    $FoundAvd = $null
    
    foreach ($name in $PossibleNames) {
        if ($AvdList -contains $name) {
            $FoundAvd = $name
            break
        }
    }
    
    if ($FoundAvd) {
        Write-Host "Found Pixel 8a AVD with name: $FoundAvd" -ForegroundColor Green
        $AvdName = $FoundAvd
    } else {
        Write-Host "Error: No Pixel 8a AVD found. Please create one in Android Studio:" -ForegroundColor Red
        Write-Host "1. Open Android Studio" -ForegroundColor Yellow
        Write-Host "2. Go to Tools → AVD Manager" -ForegroundColor Yellow
        Write-Host "3. Click 'Create Virtual Device'" -ForegroundColor Yellow
        Write-Host "4. Select 'Pixel 8a' and follow the setup" -ForegroundColor Yellow
        exit 1
    }
} else {
    $AvdName = "Pixel_8a"
}

# Check if emulator is already running
Write-Host "Checking if emulator is already running..." -ForegroundColor Yellow
$AdbPath = "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools\adb.exe"

if (Test-Path $AdbPath) {
    $RunningDevices = & $AdbPath devices 2>$null | Select-String "emulator-"
    if ($RunningDevices) {
        Write-Host "Emulator is already running:" -ForegroundColor Yellow
        $RunningDevices | ForEach-Object { Write-Host "  $($_.ToString().Trim())" -ForegroundColor Cyan }
        
        $Response = Read-Host "Do you want to start another instance? (y/N)"
        if ($Response -notmatch "^[Yy]") {
            Write-Host "Emulator launch cancelled." -ForegroundColor Yellow
            exit 0
        }
    }
}

# Launch the emulator
Write-Host "Launching Pixel 8a emulator ($AvdName)..." -ForegroundColor Green
Write-Host "This may take a few minutes on first launch..." -ForegroundColor Yellow

try {
    # Start emulator in background
    Start-Process -FilePath $EmulatorPath -ArgumentList "-avd", $AvdName -WindowStyle Hidden
    Write-Host "Pixel 8a emulator started successfully!" -ForegroundColor Green
    Write-Host "The emulator window should appear shortly." -ForegroundColor Cyan
    Write-Host "You can now run 'npx expo start' and press 'a' to deploy your app." -ForegroundColor Cyan
} catch {
    Write-Host "Error starting emulator: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 