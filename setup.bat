@echo off

REM Open a new terminal window for CLIENT and run npm start
start cmd /k "cd Client && npm run dev"

REM Open a new terminal window for SERVER and run npm start
start cmd /k "cd Server && npm start"

pause