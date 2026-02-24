@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM NISHA GORIEL PHOTOGRAPHY - WINDOWS SETUP SCRIPT
REM ============================================================
REM One-click setup for Windows developers
REM ============================================================

echo.
echo ============================================================
echo   NISHA GORIEL PHOTOGRAPHY - WINDOWS SETUP
echo ============================================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 20+ from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js !NODE_VERSION! found

REM Check if Python is installed
echo [2/6] Checking Python installation...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python 3.11+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo Then run this script again.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [OK] Python !PYTHON_VERSION! found

REM Database setup is handled via Supabase (see SUPABASE_SETUP.md)
echo [3/6] Database setup...
echo [INFO] Make sure you have configured your Supabase project as described in SUPABASE_SETUP.md
echo.

REM Setup Backend
echo [4/6] Setting up backend...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Installing Python dependencies...
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy /Y .env.example .env >nul
    echo [INFO] Please edit backend\.env and set a secure JWT_SECRET
    echo [INFO] You can generate one using: python -c "import secrets; print(secrets.token_urlsafe(32))"
)
cd ..

REM Setup Frontend
echo [5/6] Setting up frontend...
cd frontend
if not exist node_modules (
    echo Installing Node.js dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Node modules already installed, skipping...
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy /Y .env.example .env >nul
)
cd ..

echo [6/6] Setup complete!
echo.
echo ============================================================
echo   NEXT STEPS
echo ============================================================
echo.
echo 1. Edit backend\.env and set a secure JWT_SECRET
echo 2. Edit frontend\.env if your backend runs on a different port
echo 3. Make sure Supabase project is active and schema is run
echo 4. Run: npm start
echo.
echo ============================================================
echo   QUICK START
echo ============================================================
echo.
echo To start the development servers:
echo   npm start
echo.
echo This will start both backend and frontend concurrently.
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo Admin login: http://localhost:3000/admin/login
echo   Email: info@nishagoriel.com
echo   Password: admin123
echo.
echo ============================================================
pause
