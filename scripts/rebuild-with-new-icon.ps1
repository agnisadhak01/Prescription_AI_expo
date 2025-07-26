#!/usr/bin/env powershell

# Rebuild App with New Icon Script
# This script rebuilds the app after icon changes

Write-Host "🎨 Rebuilding App with New Icon..." -ForegroundColor Green
Write-Host "📱 Icon files to be updated:" -ForegroundColor Cyan
Write-Host "   - icon.png" -ForegroundColor White
Write-Host "   - adaptive-icon.png" -ForegroundColor White

# Check if we're in the correct directory
if (-not (Test-Path "app.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if icon files exist
$iconPath = "assets/images/icon.png"
$adaptiveIconPath = "assets/images/adaptive-icon.png"

if (-not (Test-Path $iconPath)) {
    Write-Host "❌ Error: icon.png not found at $iconPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $adaptiveIconPath)) {
    Write-Host "❌ Error: adaptive-icon.png not found at $adaptiveIconPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Icon files found" -ForegroundColor Green

# Stop any running Metro server
Write-Host "🛑 Stopping Metro server if running..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force
    Write-Host "✅ Metro server stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No Metro server running" -ForegroundColor Cyan
}

# Clean Expo cache
Write-Host "🧹 Cleaning Expo cache..." -ForegroundColor Yellow
try {
    npx expo start --clear
    Start-Sleep -Seconds 3
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force
    Write-Host "✅ Expo cache cleared" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not clear Expo cache" -ForegroundColor Yellow
}

# Clean and rebuild native code
Write-Host "🔨 Cleaning native code..." -ForegroundColor Yellow
try {
    npx expo prebuild --clean
    if ($LASTEXITCODE -ne 0) {
        throw "Expo prebuild failed"
    }
    Write-Host "✅ Native code cleaned" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during prebuild: $_" -ForegroundColor Red
    exit 1
}

# Rebuild Android app
Write-Host "📦 Rebuilding Android app..." -ForegroundColor Yellow
try {
    npx expo run:android
    if ($LASTEXITCODE -ne 0) {
        throw "Android build failed"
    }
    Write-Host "✅ Android app rebuilt successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during Android build: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative: Try building APK directly:" -ForegroundColor Yellow
    Write-Host "   .\build-test-apk.ps1" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🎉 SUCCESS! App rebuilt with new icon!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Check the app icon on your device/emulator" -ForegroundColor White
Write-Host "2. If icon still shows old version, try:" -ForegroundColor White
Write-Host "   - Uninstall and reinstall the app" -ForegroundColor White
Write-Host "   - Clear app cache on device" -ForegroundColor White
Write-Host "   - Restart the device/emulator" -ForegroundColor White
Write-Host ""
Write-Host "🔧 If issues persist, try building APK:" -ForegroundColor Yellow
Write-Host "   .\build-test-apk.ps1" -ForegroundColor White 