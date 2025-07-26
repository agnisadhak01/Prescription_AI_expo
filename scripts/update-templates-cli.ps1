# PowerShell script to update Supabase email templates

# Check if Supabase CLI is installed
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Supabase CLI is not installed. Installing..." -ForegroundColor Yellow
    npm install -g supabase
}

Write-Host "Updating email templates using Supabase CLI..." -ForegroundColor Cyan

# Check if Supabase is initialized in this project
if (!(Test-Path -Path "./supabase/config.toml")) {
    Write-Host "This project doesn't appear to be initialized with Supabase CLI." -ForegroundColor Red
    Write-Host "Run 'supabase init' to initialize the project first." -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running." -ForegroundColor Green
} catch {
    Write-Host "Docker doesn't appear to be running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# For local development, this will apply the template changes with debug output
Write-Host "Restarting Supabase services to apply template changes..." -ForegroundColor Cyan
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
supabase stop; supabase start --debug

Write-Host "`n✅ Local templates updated successfully!" -ForegroundColor Green

# For hosted projects, you need to use the Management API approach
Write-Host ""
Write-Host "NOTE: For hosted projects, you'll need to:" -ForegroundColor Yellow
Write-Host "1. Generate an access token at https://supabase.com/dashboard/account/tokens" -ForegroundColor White
Write-Host "2. Create a .env file with your SUPABASE_ACCESS_TOKEN" -ForegroundColor White
Write-Host "3. Run 'node update-email-templates.js' to update the hosted project" -ForegroundColor White 