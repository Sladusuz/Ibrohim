@echo off
chcp 65001 >nul
REM BISRARO saytini GitHub'ga yuklash (Windows)
REM Talab: Git o'rnatilgan bo'lishi kerak -> https://git-scm.com/download/win
cd /d "%~dp0"

set REPO=https://github.com/Sladusuz/bisraro.git

where git >nul 2>nul
if errorlevel 1 (
  echo [XATO] Git topilmadi. Avval o'rnating: https://git-scm.com/download/win
  pause
  exit /b 1
)

if not exist ".git" git init
git checkout -B main
git add -A
git commit -m "BISRARO sayti" 2>nul
git remote remove origin 2>nul
git remote add origin %REPO%
git push -u origin main

echo.
echo Tayyor! Repozitoriy: https://github.com/Sladusuz/bisraro
echo Sayt (Pages yoqilgandan keyin): https://sladusuz.github.io/bisraro/
pause
