# TradeX CLI - PowerShell Version
param(
    [Parameter(Position=0)]
    [string]$Command
)

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ProjectRoot "tradex-frontend"
$BackendDir = Join-Path $ProjectRoot "tradex-backend"

function Show-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         TradeX Development Server        ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Start-Services {
    Write-Host "[1/2] Starting Backend (FastAPI)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir'; python -m uvicorn main:app --reload --port 8000"
    Start-Sleep -Seconds 2

    Write-Host "[2/2] Starting Frontend (Vite)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm run dev"

    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
    Write-Host " Services Starting..." -ForegroundColor Green
    Write-Host "───────────────────────────────────────────" -ForegroundColor Green
    Write-Host " Frontend:  http://localhost:5173" -ForegroundColor White
    Write-Host " Backend:   http://localhost:8000" -ForegroundColor White
    Write-Host " API Docs:  http://localhost:8000/docs" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C in each window to stop services." -ForegroundColor DarkGray
}

function New-TestUser {
    Write-Host "Creating test user..." -ForegroundColor Yellow
    $scriptPath = Join-Path $FrontendDir "scripts\create-test-user.js"
    if (Test-Path $scriptPath) {
        Push-Location $FrontendDir
        node scripts/create-test-user.js
        Pop-Location
    } else {
        Write-Host "Test user script not found. Creating..." -ForegroundColor Red
    }
}

function Show-Help {
    Write-Host "Usage: tradex <command>" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  run          Start all services (frontend + backend)"
    Write-Host "  test-user    Create a test user for development"
    Write-Host "  --help       Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor DarkGray
    Write-Host "  tradex run"
    Write-Host "  tradex test-user"
}

Show-Banner

switch ($Command) {
    "run" { Start-Services }
    "test-user" { New-TestUser }
    "--help" { Show-Help }
    "-h" { Show-Help }
    default { Show-Help }
}
