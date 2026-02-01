@echo off
cd /d "%~dp0"
echo [Path] %CD%
echo [Run] git push origin main
echo.
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
  echo OK. Pushed. Vercel will auto-deploy.
) else (
  echo FAIL. Check error above.
)
echo.
pause
