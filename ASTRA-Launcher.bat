@echo off
title ASTRA AI Operating System — Quantum Kernel
color 0B

echo =================================================
echo  ⚡ ASTRA AI OPERATING SYSTEM v10.0-ULTRA
echo  Initializing Kernel and Desktop HUD...
echo =================================================
echo.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [!] Node.js is not found in PATH. Please install Node.js v20+ to run ASTRA OS.
    pause
    exit /b 1
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [*] Installing dependencies...
    call npm install
)

:: Start Backend Kernel in a new window
echo [✓] Starting ASTRA Kernel (Port 8990)...
start "ASTRA Kernel Daemon" cmd /k "node server/index.js"

:: Wait 2 seconds for kernel initialization
timeout /t 2 /nobreak >nul

:: Start Frontend UI
echo [✓] Starting ASTRA Desktop HUD (Port 5173)...
start "ASTRA Desktop HUD" cmd /k "npm run dev"

:: Wait 3 seconds and open browser
timeout /t 3 /nobreak >nul
echo [✓] Opening ASTRA OS HUD in browser...
start http://localhost:5173

echo.
echo =================================================
echo  ASTRA OS is running!
echo  Press any key in this window to exit launcher.
echo =================================================
pause >nul
