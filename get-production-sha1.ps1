#!/usr/bin/env powershell
# Google SSO Production SHA-1 Fingerprint Helper Script
# 
# This script helps you get the production SHA-1 fingerprint needed
# to fix Google SSO authentication issues in Play Store builds.

Write-Host "Google SSO Production Fix Helper" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

Write-Host "This script will help you fix the Google SSO authentication issue in your Play Store build." -ForegroundColor Yellow
Write-Host ""

# Check if user is using Google Play App Signing (recommended path)
Write-Host "STEP 1: Get Production SHA-1 Fingerprint" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option A: Google Play App Signing (Recommended)" -ForegroundColor Green
Write-Host "1. Go to Google Play Console: https://play.google.com/console" -ForegroundColor White
Write-Host "2. Navigate to: Your App → Release → Setup → App signing" -ForegroundColor White
Write-Host "3. Copy the SHA-1 certificate fingerprint from 'App signing key certificate' section" -ForegroundColor White
Write-Host ""

Write-Host "Option B: Your Own Keystore" -ForegroundColor Green
Write-Host "If you're using your own production keystore, run:" -ForegroundColor White
Write-Host "keytool -list -v -keystore your-release-key.keystore -alias your-key-alias" -ForegroundColor Gray
Write-Host ""

$sha1 = Read-Host "Enter the production SHA-1 fingerprint (without colons)"

if (-not $sha1) {
    Write-Host "No SHA-1 fingerprint provided. Exiting..." -ForegroundColor Red
    exit 1
}

# Format the SHA-1 fingerprint properly
$sha1 = $sha1.ToUpper().Replace(":", "").Replace(" ", "")

Write-Host ""
Write-Host "STEP 2: Update Google Cloud Console" -ForegroundColor Cyan
Write-Host "------------------------------------" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your production SHA-1 fingerprint: $sha1" -ForegroundColor Green
Write-Host ""

Write-Host "Now follow these steps:" -ForegroundColor Yellow
Write-Host "1. Go to Google Cloud Console: https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Navigate to: APIs & Credentials → Credentials" -ForegroundColor White
Write-Host "3. Find your OAuth 2.0 Client ID for Android" -ForegroundColor White
Write-Host "4. Click Edit" -ForegroundColor White
Write-Host "5. In 'Signing-certificate fingerprint' section, ADD this fingerprint:" -ForegroundColor White
Write-Host "   $sha1" -ForegroundColor Green
Write-Host "6. Keep the existing development fingerprint (don't replace it)" -ForegroundColor Red
Write-Host "7. Save the configuration" -ForegroundColor White
Write-Host ""

$proceed = Read-Host "Have you updated the Google Cloud Console? (y/n)"

if ($proceed -ne "y" -and $proceed -ne "Y") {
    Write-Host "Please complete the Google Cloud Console update first, then run this script again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 3: Update google-services.json" -ForegroundColor Cyan
Write-Host "------------------------------------" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option A: Download new google-services.json (Recommended)" -ForegroundColor Green
Write-Host "1. Go to Firebase Console: https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Go to Project Settings → General → Your apps" -ForegroundColor White
Write-Host "4. Download the updated google-services.json" -ForegroundColor White
Write-Host "5. Replace the current google-services.json in your project root" -ForegroundColor White
Write-Host ""

Write-Host "Option B: Manual update (Advanced)" -ForegroundColor Green
Write-Host "Add this OAuth client entry to your google-services.json:" -ForegroundColor White
Write-Host @"
{
  "client_id": "YOUR_NEW_CLIENT_ID_FROM_GOOGLE_CLOUD_CONSOLE",
  "client_type": 1,
  "android_info": {
    "package_name": "com.ausomemgr.prescription",
    "certificate_hash": "$sha1"
  }
}
"@ -ForegroundColor Gray
Write-Host ""

$updated = Read-Host "Have you updated the google-services.json? (y/n)"

if ($updated -ne "y" -and $updated -ne "Y") {
    Write-Host "Please update the google-services.json file first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 4: Build and Test" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor Cyan
Write-Host ""

Write-Host "Now build a new version and test:" -ForegroundColor Yellow
Write-Host "1. Build: npx eas build --platform android --profile production" -ForegroundColor White
Write-Host "2. Upload to Play Store as Internal Testing" -ForegroundColor White
Write-Host "3. Download and test Google SSO functionality" -ForegroundColor White
Write-Host ""

Write-Host "Configuration Summary:" -ForegroundColor Green
Write-Host "---------------------" -ForegroundColor Green
Write-Host "Package: com.ausomemgr.prescription" -ForegroundColor White
Write-Host "Development SHA-1: ABF15BE5666196500666777FE27CD0709366A01CD" -ForegroundColor White
Write-Host "Production SHA-1: $sha1" -ForegroundColor Green
Write-Host "Web Client ID: 232795038046-rld1dn9s7ocnt93ouec71s27p9ir4pco.apps.googleusercontent.com" -ForegroundColor White
Write-Host ""

$build = Read-Host "Would you like to start the build process now? (y/n)"

if ($build -eq "y" -or $build -eq "Y") {
    Write-Host "Starting EAS build..." -ForegroundColor Green
    try {
        # Increment version code first
        Write-Host "Incrementing version code..." -ForegroundColor Yellow
        $appJsonPath = "app.json"
        
        if (Test-Path $appJsonPath) {
            $appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json
            $currentVersionCode = $appJson.expo.android.versionCode
            $newVersionCode = $currentVersionCode + 1
            $appJson.expo.android.versionCode = $newVersionCode
            
            $appJson | ConvertTo-Json -Depth 20 | Set-Content $appJsonPath
            Write-Host "Version code updated from $currentVersionCode to $newVersionCode" -ForegroundColor Green
        }
        
        # Start the build
        npx eas build --platform android --profile production
    } catch {
        Write-Host "Build failed. Please run the build command manually:" -ForegroundColor Red
        Write-Host "npx eas build --platform android --profile production" -ForegroundColor Gray
    }
} else {
    Write-Host "Build process skipped. Run this command when ready:" -ForegroundColor Yellow
    Write-Host "npx eas build --platform android --profile production" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Fix completed! Your Google SSO should now work in the Play Store build." -ForegroundColor Green
Write-Host "If you still encounter issues, check the troubleshooting section in GOOGLE_SSO_PRODUCTION_FIX.md" -ForegroundColor Yellow 