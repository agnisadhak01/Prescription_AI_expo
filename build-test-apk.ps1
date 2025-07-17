#!/usr/bin/env powershell

# Build Test APK Script for Local Testing
# This script builds a test APK for testing the webhook changes

Write-Host "🚀 Building Test APK for Local Testing..." -ForegroundColor Green
Write-Host "📡 Using webhook: https://n8n.ausomemgr.com/webhook/prescription-multi-ocr" -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path "android/app/build.gradle")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check for debug keystore (automatic for debug builds)
Write-Host "🔑 Using debug keystore for testing..." -ForegroundColor Yellow

# Clean previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
try {
    cd android
    ./gradlew clean
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle clean failed"
    }
    Write-Host "✅ Clean completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during clean: $_" -ForegroundColor Red
    cd ..
    exit 1
}

# Build debug APK
Write-Host "📦 Building debug APK..." -ForegroundColor Yellow
try {
    ./gradlew assembleDebug
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle assembleDebug failed"
    }
    Write-Host "✅ Debug APK built successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during build: $_" -ForegroundColor Red
    cd ..
    exit 1
}

# Check if APK was created
$apkPath = "app/build/outputs/apk/debug/app-debug.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length
    $apkSizeMB = [math]::Round($apkSize / 1MB, 1)
    Write-Host "📱 APK created successfully!" -ForegroundColor Green
    Write-Host "   Path: android/$apkPath" -ForegroundColor Cyan
    Write-Host "   Size: $apkSizeMB MB" -ForegroundColor Cyan
    
    # Copy to root directory for easy access
    $timestamp = Get-Date -Format "yyyyMMdd-HHmm"
    $rootApkPath = "../test-apk-multi-ocr-$timestamp.apk"
    Copy-Item $apkPath $rootApkPath
    Write-Host "   Copied to: test-apk-multi-ocr-$timestamp.apk" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! Your test APK is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Testing checklist:" -ForegroundColor Yellow
    Write-Host "1. Install APK on device: adb install test-apk-multi-ocr-$timestamp.apk" -ForegroundColor White
    Write-Host "2. Test prescription scanning with new webhook endpoint" -ForegroundColor White
    Write-Host "3. Verify OCR processing works with multi-ocr endpoint" -ForegroundColor White
    Write-Host "4. Check scan quota deduction after successful processing" -ForegroundColor White
    Write-Host ""
    Write-Host "📡 Webhook endpoint: https://n8n.ausomemgr.com/webhook/prescription-multi-ocr" -ForegroundColor Cyan
    Write-Host "🔧 This is a debug build - for testing only, not for production" -ForegroundColor Yellow
    
} else {
    Write-Host "❌ Error: APK file not found at expected location" -ForegroundColor Red
    cd ..
    exit 1
}

cd ..
Write-Host "✅ Build script completed successfully!" -ForegroundColor Green 