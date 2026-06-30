@echo off
title DocuShield Server
echo.
echo  ======================================
echo   DocuShield - Starting Server...
echo  ======================================
echo.
echo  [+] Starting backend on http://localhost:8000
echo  [+] Opening browser...
echo.

:: Open browser after 3 seconds
start "" timeout /t 3 /nobreak >nul && start "" "http://localhost:8000"

:: Start the server
cd /d C:\Users\sunka\docushield\backend
python -m uvicorn main:app --port 8000

pause
