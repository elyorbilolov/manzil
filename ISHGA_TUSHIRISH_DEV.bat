@echo off
title Manzillar Reestri AT (Dev Mode)
color 0B
echo ================================================================
echo   MANZILLAR REESTRI AT (DASTURLASH / DEV REJIMI)
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo ================================================================
echo.

cd /d "%~dp0"
npm run dev
pause
