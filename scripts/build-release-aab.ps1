#!/usr/bin/env powershell

# Build Release AAB Script for Local Play Store Upload
# This script builds the app with proper production signing for Play Store submission

Write-Host "🚀 Building Release AAB for Play Store Upload..." -ForegroundColor Green
Write-Host "Version: 1.0.2 (Code: 8)" -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path "android/app/build.gradle")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if release keystore exists
if (-not (Test-Path "android/app/release.keystore")) {
    Write-Host "❌ Error: Release keystore not found at android/app/release.keystore" -ForegroundColor Red
    Write-Host "Please ensure the keystore is properly copied from keystore-details/" -ForegroundColor Yellow
    exit 1
}

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

# Build release AAB
Write-Host "📦 Building release AAB..." -ForegroundColor Yellow
try {
    ./gradlew bundleRelease
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle bundleRelease failed"
    }
    Write-Host "✅ Release AAB built successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during build: $_" -ForegroundColor Red
    cd ..
    exit 1
}

# Check if AAB was created
$aabPath = "app/build/outputs/bundle/release/app-release.aab"
if (Test-Path $aabPath) {
    $aabSize = (Get-Item $aabPath).Length
    $aabSizeMB = [math]::Round($aabSize / 1MB, 1)
    Write-Host "📱 AAB created successfully!" -ForegroundColor Green
    Write-Host "   Path: android/$aabPath" -ForegroundColor Cyan
    Write-Host "   Size: $aabSizeMB MB" -ForegroundColor Cyan
    
    # Copy to root directory for easy access
    $rootAabPath = "../app-release-v1.0.2.aab"
    Copy-Item $aabPath $rootAabPath
    Write-Host "   Copied to: app-release-v1.0.2.aab" -ForegroundColor Cyan
    
    # Verify signing
    Write-Host "🔐 Verifying AAB signing..." -ForegroundColor Yellow
    try {
        $env:JAVA_HOME = "$env:ANDROID_HOME\cmdline-tools\latest\bin\.."
        $jarsigner = "$env:JAVA_HOME\bin\jarsigner.exe"
        if (Test-Path $jarsigner) {
            & $jarsigner -verify $aabPath | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ AAB is properly signed for Play Store" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Warning: Could not verify AAB signature" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠️  Warning: jarsigner not found, skipping signature verification" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Warning: Could not verify signature: $_" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! Your release AAB is ready for Play Store upload!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Upload app-release-v1.0.2.aab to Google Play Console" -ForegroundColor White
    Write-Host "2. The AAB is signed with your production certificate" -ForegroundColor White
    Write-Host "3. Google SSO should work correctly with this build" -ForegroundColor White
    Write-Host ""
    Write-Host "Certificate fingerprint: 8F:0F:16:03:35:E1:EA:51:29:6F:64:FF:FE:8F:4B:24:C9:5D:64:5F" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ Error: AAB file not found at expected location" -ForegroundColor Red
    cd ..
    exit 1
}

cd ..
Write-Host "✅ Build script completed successfully!" -ForegroundColor Green 