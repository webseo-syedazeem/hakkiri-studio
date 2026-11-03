@echo off
setlocal EnableExtensions
title Hakkiri Studio
cd /d "%~dp0"

echo.
echo   Hakkiri Studio
echo   --------------
echo.

rem ---- 1. Node.js ------------------------------------------------------------
where node >nul 2>nul
if not errorlevel 1 goto :check_version

echo   Node.js isn't on this laptop yet, so it's being installed now.
echo   If Windows asks "Do you want to allow this app to make changes", click Yes.
echo.
where winget >nul 2>nul
if errorlevel 1 goto :manual_node
winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
set "PATH=%PATH%;%ProgramFiles%\nodejs"
where node >nul 2>nul
if errorlevel 1 goto :manual_node

:check_version
for /f "tokens=1,2 delims=v." %%a in ('node -v') do (
  set "NODE_MAJOR=%%a"
  set "NODE_MINOR=%%b"
)
if %NODE_MAJOR% LSS 20 goto :old_node
if %NODE_MAJOR% EQU 20 if %NODE_MINOR% LSS 9 goto :old_node
echo   Node.js v%NODE_MAJOR%.%NODE_MINOR% is ready.
echo.

rem ---- 2. Keys -----------------------------------------------------------------
if exist ".env.local" goto :packages
echo   Note: there's no .env.local file in this folder, so answers will show demo feedback.
echo   Copy .env.example, rename the copy to .env.local and add your keys to score real answers.
echo.

rem ---- 3. Packages (first run, and again when an update adds new ones) ---------
:packages
rem An older Hakkiri window may still be running. Stop it first, so updates install and load fresh.
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /c:"127.0.0.1:3000 " ^| findstr /c:"LISTENING"') do (
  tasklist /fi "PID eq %%p" | find /i "node.exe" >nul && taskkill /pid %%p /f >nul 2>nul && echo   Closed the Hakkiri that was already running.
)
if not exist "node_modules\next\package.json" goto :install
fc /b "package.json" "node_modules\.hakkiri-package.json" >nul 2>nul
if errorlevel 1 goto :update
goto :run

:update
echo   This update needs a few new packages. Installing them now, about a minute...
echo.
goto :do_install

:install
echo   Installing the app's packages. The first time takes a minute or two...
echo.

:do_install
call npm install --no-audit --no-fund
if errorlevel 1 goto :npm_failed
copy /y "package.json" "node_modules\.hakkiri-package.json" >nul

rem ---- 4. Run --------------------------------------------------------------------
:run
echo.
echo   Starting Hakkiri. Your browser will open it in a few seconds.
echo   Keep this window open while you use the app. Close it to stop the app.
echo   After an update, just double-click start-hakkiri again.
echo.
start "" /min cmd /c "timeout /t 12 /nobreak >nul & start http://127.0.0.1:3000/"
call npm run dev -- -H 127.0.0.1
goto :end

:old_node
echo   This laptop has Node.js v%NODE_MAJOR%.%NODE_MINOR%, and the app needs version 20.9 or newer.
echo   Your browser will open the Node.js download page. Install the LTS version,
echo   then double-click start-hakkiri again.
start "" https://nodejs.org/en/download
goto :end

:manual_node
echo.
echo   Node.js couldn't be installed automatically.
echo   Your browser will open the Node.js download page. Download the LTS Windows installer,
echo   run it with the default options, then double-click start-hakkiri again.
start "" https://nodejs.org/en/download
goto :end

:npm_failed
echo.
echo   The package install didn't finish. Check the internet connection,
echo   then double-click start-hakkiri again.
goto :end

:end
echo.
pause
