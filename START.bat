@echo off
title CampusGPT - Launcher
color 0B

echo.
echo  ================================================
echo   CAMPUSGPT - AI Career ^& Interview Coach
echo   Starting Application...
echo  ================================================
echo.

:: Check setup was done
if not exist "backend\venv" (
    echo [ERROR] Setup not done. Please run SETUP.bat first.
    pause
    exit /b 1
)
if not exist "frontend\node_modules" (
    echo [ERROR] Frontend not installed. Please run SETUP.bat first.
    pause
    exit /b 1
)

echo  Starting Backend API on http://localhost:8000 ...
start "CampusGPT Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo  Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

echo  Starting Frontend on http://localhost:5173 ...
start "CampusGPT Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo  Waiting for frontend to compile...
timeout /t 5 /nobreak >nul

echo.
echo  ================================================
echo   CampusGPT is running!
echo  ------------------------------------------------
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo  ================================================
echo.
echo  Opening browser...
start http://localhost:5173

echo  To stop: close the two terminal windows
echo.
pause
