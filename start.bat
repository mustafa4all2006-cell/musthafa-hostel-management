@echo off
title Hostel Management System
echo ========================================================
echo        Starting Hostel Management System...
echo ========================================================
echo.
echo Opening browser at http://localhost:3000 ...
start http://localhost:3000
echo.
echo Starting Node server... (Press Ctrl+C to stop)
node server.js
pause
