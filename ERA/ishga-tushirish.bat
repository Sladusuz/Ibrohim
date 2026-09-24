@echo off
chcp 65001 >nul
title ERA sayti
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js o'rnatilmagan.
  echo  Hozir nodejs.org sayti ochiladi: "LTS" versiyasini yuklab, o'rnating,
  echo  so'ng shu faylni qayta ikki marta bosing.
  echo.
  start "" https://nodejs.org
  pause
  exit /b 1
)
echo.
echo  ERA sayti ishga tushmoqda...
echo  Bu oynani YOPMANG - yopsangiz sayt va admin panel to'xtaydi.
echo.
start "" /b cmd /c "timeout /t 2 >nul & start "" http://localhost:3000/admin & start "" http://localhost:3000"
node server.js
pause
