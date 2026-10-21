@echo off
title Manzillar Reestri AT
color 0A
echo ================================================================
echo   "KO'CHMAS MULK MANZILLARI REESTRI" AT ISHGA TUSHMOQDA...
echo ================================================================
echo.

cd /d "%~dp0"

echo Brauzer ochilmoqda: http://localhost:5000
start "" http://localhost:5000

echo Server ishga tushirilmoqda...
node server/dist/index.js
pause
