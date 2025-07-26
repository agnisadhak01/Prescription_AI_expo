Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Production AAB for Prescription AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking EAS CLI version..." -ForegroundColor Yellow
try {
    $easVersion = npx eas --version 2>$null
    Write-Host "EAS CLI version: $easVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g @expo/eas-cli
}

Write-Host ""
Write-Host "Checking EAS login status..." -ForegroundColor Yellow
try {
    $whoami = npx eas whoami 2>$null
    Write-Host "Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "Please login to EAS first:" -ForegroundColor Red
    Write-Host "npx eas login" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host ""
Write-Host "Starting production AAB build..." -ForegroundColor Yellow
Write-Host "This will take 10-20 minutes..." -ForegroundColor Yellow
Write-Host ""

try {
    npx eas build --platform android --profile production --clear-cache
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "Check your EAS dashboard for the AAB file." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Build failed! Check the error messages above." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Read-Host "Press Enter to continue" 