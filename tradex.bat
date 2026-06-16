@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
set "FRONTEND_DIR=%PROJECT_ROOT%tradex-frontend"
set "BACKEND_DIR=%PROJECT_ROOT%tradex-backend"

echo.
echo ╔══════════════════════════════════════════╗
echo ║         TradeX Development Server        ║
echo ╚══════════════════════════════════════════╝
echo.

if "%1"=="run" goto :run
if "%1"=="--help" goto :help
if "%1"=="-h" goto :help
if "%1"=="test-user" goto :test_user
goto :help

:run
echo [1/2] Starting Backend (FastAPI)...
start "TradeX Backend" cmd /k "cd /d %BACKEND_DIR% && python -m uvicorn main:app --reload --port 8000"
timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (Vite)...
start "TradeX Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

echo.
echo ════════════════════════════════════════════
echo  Services Starting...
echo ────────────────────────────────────────────
echo  Frontend:  http://localhost:5173
echo  Backend:   http://localhost:8000
echo  API Docs:  http://localhost:8000/docs
echo ════════════════════════════════════════════
echo.
echo Press Ctrl+C in each window to stop services.
goto :end

:test_user
echo Creating test user...
cd /d "%FRONTEND_DIR%" && node scripts/create-test-user.js
goto :end

:help
echo Usage: tradex ^<command^>
echo.
echo Commands:
echo   run          Start all services (frontend + backend)
echo   test-user    Create a test user for development
echo   --help       Show this help message
echo.
echo Examples:
echo   tradex run
echo   tradex test-user
goto :end

:end
endlocal
