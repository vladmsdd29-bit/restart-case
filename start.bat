@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing. Install the LTS version from https://nodejs.org/
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js LTS and restart Windows.
  pause
  exit /b 1
)
echo Installing project packages...
call npm install
if errorlevel 1 (
  echo Package installation failed. Check your internet connection.
  pause
  exit /b 1
)
echo Starting RESTART CASE at http://localhost:3000
call npm run dev
pause
