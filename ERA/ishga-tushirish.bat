@echo off
chcp 65001 >nul
title ERA sayti - bu oynani yopmang
cd /d "%~dp0"

rem Zip ichidagi tayyor Node.js (o'rnatish shart emas); bo'lmasa kompyuterdagi Node.js
set "NODE=%~dp0node\node.exe"
if not exist "%NODE%" set "NODE=node"
"%NODE%" -v >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js topilmadi. ERA papkasi ichida "node" papkasi bo'lishi kerak.
  echo  Zip faylni to'liq ochib ^(Extract All^), qaytadan urinib ko'ring.
  echo.
  pause
  exit /b 1
)

echo.
echo  ==========================================================
echo    ERA sayti ishga tushdi
echo.
echo    Sayt:         http://localhost:3000
echo    Admin panel:  http://localhost:3000/admin
echo    Login: eratashkent      Parol: era2026
echo.
echo    Bu oynani YOPMANG - yopsangiz sayt to'xtaydi.
echo  ==========================================================
echo.
start "" /b cmd /c "timeout /t 2 >nul & start "" http://localhost:3000/admin & start "" http://localhost:3000"
"%NODE%" server.js
echo.
echo  Server to'xtadi. Yuqoridagi xabarni o'qing.
pause
