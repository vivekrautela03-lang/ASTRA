@echo off
title ASTRA AI Assistant — Native Windows Desktop App
color 0B

echo =================================================
echo  ⚡ ASTRA NATIVE WINDOWS DESKTOP AI ASSISTANT
echo  Launching Astra.exe directly...
echo =================================================
echo.

if exist "release\win-unpacked\Astra.exe" (
    echo [✓] Starting packaged Astra.exe...
    start "" "release\win-unpacked\Astra.exe"
    exit /b 0
)

:: Fallback to local electron runtime
where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] Starting via Electron runtime...
    start "" npx electron .
    exit /b 0
)

echo [!] Could not locate Astra.exe or npx.
pause
