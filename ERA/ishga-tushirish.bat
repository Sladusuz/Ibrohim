@echo off
chcp 65001 >nul
title ERA sayti - bu oynani yopmang
cd /d "%~dp0"

set "NODEVER=v24.21.0"
set "NODESHA=158f7685b44de51f6c0df1d153526cbcd3e1bc739a8dfc607721cef75de9e541"
set "NODE=%~dp0node\node.exe"

if exist "%NODE%" goto run
where node >nul 2>nul
if not errorlevel 1 ( set "NODE=node" & goto run )

echo.
echo  Birinchi ishga tushirish: Node.js yuklab olinmoqda (taxminan 30 MB).
echo  Hech narsa o'rnatilmaydi - faqat shu papkaga saqlanadi. Biroz kuting...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol='Tls12';" ^
  "$v='%NODEVER%'; $zip=Join-Path $env:TEMP ('node-'+$v+'-win-x64.zip');" ^
  "Invoke-WebRequest -UseBasicParsing ('https://nodejs.org/dist/'+$v+'/node-'+$v+'-win-x64.zip') -OutFile $zip;" ^
  "if ((Get-FileHash $zip -Algorithm SHA256).Hash.ToLower() -ne '%NODESHA%') { throw 'Yuklangan fayl buzilgan (checksum mos emas)' };" ^
  "$tmp=Join-Path $env:TEMP ('node-'+$v); if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force };" ^
  "Expand-Archive $zip -DestinationPath $tmp -Force;" ^
  "New-Item -ItemType Directory -Force -Path 'node' | Out-Null;" ^
  "Copy-Item (Join-Path $tmp ('node-'+$v+'-win-x64\node.exe')) 'node\node.exe' -Force;" ^
  "Remove-Item $zip,$tmp -Recurse -Force"
if not exist "%NODE%" (
  echo.
  echo  Node.js yuklab bo'lmadi. Internet aloqasini tekshirib, qaytadan urinib ko'ring.
  echo.
  pause
  exit /b 1
)

:run
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
