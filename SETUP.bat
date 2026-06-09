@echo off
title CampusGPT - Setup
color 0B

echo.
echo  ================================================
echo   CAMPUSGPT - AI Career ^& Interview Coach
echo   Setup Script for Windows
echo  ================================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)
echo [OK] Python found

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

:: Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)
echo [OK] npm found

echo.
echo  [1/4] Setting up Python backend...
echo  ------------------------------------------------
cd backend

:: Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate and install
call venv\Scripts\activate.bat
echo Installing Python packages (this may take 2-3 minutes)...
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [WARNING] Some packages may have failed. Trying critical packages...
    pip install fastapi uvicorn python-multipart sqlalchemy aiosqlite pydantic pydantic-settings python-jose passlib httpx aiofiles python-dotenv --quiet
)

:: Create upload dirs
if not exist "uploads" mkdir uploads
if not exist "tts_cache" mkdir tts_cache
echo [OK] Backend ready

cd ..

echo.
echo  [2/4] Setting up React frontend...
echo  ------------------------------------------------
cd frontend
echo Installing Node packages (this may take 2-3 minutes)...
call npm install --legacy-peer-deps --silent
if errorlevel 1 (
    echo [ERROR] npm install failed. Trying with --force...
    call npm install --force --silent
)
echo [OK] Frontend ready
cd ..

echo.
echo  ================================================
echo   SETUP COMPLETE!
echo  ================================================
echo.
echo  To start CampusGPT, run:  START.bat
echo.
pause
