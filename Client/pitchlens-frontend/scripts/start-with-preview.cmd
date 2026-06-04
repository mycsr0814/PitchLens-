@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "FRONT_DIR=%%~fI"
for %%I in ("%FRONT_DIR%\..") do set "REPOS_DIR=%%~fI"

set "BACKEND_DIR="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$front = (Resolve-Path '%FRONT_DIR%').Path; $repos = (Resolve-Path '%REPOS_DIR%').Path; Get-ChildItem -Path $repos -Directory | Where-Object { $_.FullName -ne $front -and (Test-Path (Join-Path $_.FullName 'app\\main.py')) -and (Test-Path (Join-Path $_.FullName 'app\\api\\slides.py')) -and (Test-Path (Join-Path $_.FullName '.venv\\Scripts\\python.exe')) } | Select-Object -First 1 -ExpandProperty FullName"`) do set "BACKEND_DIR=%%I"

if not defined BACKEND_DIR (
  echo Preview backend repository was not found next to "%FRONT_DIR%".
  echo Run the FastAPI preview server manually if PPT/PPTX images do not appear.
  goto start_frontend
)

set "PYTHON_EXE=%BACKEND_DIR%\.venv\Scripts\python.exe"

powershell -NoProfile -Command "try { Invoke-WebRequest 'http://127.0.0.1:8001/health' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo Starting local slide preview backend on http://127.0.0.1:8001 ...
  start "PitchLens Preview Backend" /MIN cmd /c "cd /d ""%BACKEND_DIR%"" && ""%PYTHON_EXE%"" -m uvicorn app.main:app --host 127.0.0.1 --port 8001"
  timeout /t 3 /nobreak >nul
)

:start_frontend
call react-scripts start
