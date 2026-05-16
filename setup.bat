@echo off
REM CozyReads Setup Script for Windows
REM This script automates the initial setup of CozyReads for development

setlocal enabledelayedexpansion

echo.
echo ================================
echo   CozyReads Development Setup
echo ================================
echo.

REM Check for Node.js
echo Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js %%i

REM Check for npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do echo [OK] npm %%i

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

REM Setup environment variables
echo.
echo Setting up environment variables...
if not exist ".env.local" (
    copy .env.example .env.local
    echo [OK] Created .env.local
    echo WARNING: Please edit .env.local and add your configuration:
    echo   - DATABASE_URL (PostgreSQL connection^)
    echo   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (from Clerk Dashboard^)
    echo   - CLERK_SECRET_KEY (from Clerk Dashboard^)
) else (
    echo [OK] .env.local already exists
)

REM Generate Prisma Client
echo.
echo Generating Prisma Client...
call npm run prisma:generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma Client
    pause
    exit /b 1
)
echo [OK] Prisma Client generated

echo.
echo ================================
echo   Setup Complete! 
echo ================================
echo.

echo Next steps:
echo 1. Edit .env.local with your configuration
echo 2. Run: npx prisma migrate dev
echo 3. Run: npm run dev
echo 4. Open: http://localhost:3000
echo.
echo For more help:
echo - Quick Start: QUICKSTART.md
echo - Architecture: ARCHITECTURE.md
echo - Contributing: CONTRIBUTING.md
echo.
pause
