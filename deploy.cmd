@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [Path] %CD%
echo.

git add .
git status --short
if %ERRORLEVEL% NEQ 0 goto err

git commit -m "deploy"
if %ERRORLEVEL% NEQ 0 (
  echo No changes to commit. Pushing...
  goto push
)

:push
git push origin main
if %ERRORLEVEL% NEQ 0 goto err

echo.
echo OK. Pushed. Vercel will auto-deploy.
goto end

:err
echo.
echo FAIL. Check error above.
:end
echo.
pause
