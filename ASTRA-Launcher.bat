@echo off
title ASTRA AI Operating System — Quantum Kernel v10.0
color 0B

echo =================================================
echo  ⚡ ASTRA AI OPERATING SYSTEM v10.0-ULTRA
echo  Starting Kernel and Desktop HUD...
echo =================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [!] Node.js not detected in PATH.
    echo Please install Node.js (v20+) from https://nodejs.org
    pause
    exit /b 1
)

:: Start Backend Kernel & UI directly on Port 8990
echo [✓] Booting ASTRA Kernel on http://localhost:8990...
start "" "http://localhost:8990"

node server/index.js

pause
