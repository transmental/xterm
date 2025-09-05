@echo off
REM xterm Global Installation Script for Windows
REM This script builds the project and installs it globally so you can use 'xpost' from anywhere

echo 🐦 Installing xterm CLI...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed. Please install Node.js first.
    echo    Visit: https://nodejs.org/
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: npm is not installed. Please install npm first.
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if errorlevel 1 exit /b 1

REM Build the project
echo 🔨 Building project...
npm run build
if errorlevel 1 exit /b 1

REM Install globally
echo 🌍 Installing globally...
npm install -g .
if errorlevel 1 exit /b 1

echo.
echo 🎉 Installation complete!
echo.
echo You can now use 'xterm' from anywhere in your terminal:
echo   xterm login          # Authenticate with X/Twitter (no setup required!)
echo   xterm                # Start interactive mode
echo   xterm post "Hello!"  # Post a tweet directly
echo.
echo To get started, run: xterm login
echo No API credentials needed - xterm includes defaults to get you started!
echo.
pause
