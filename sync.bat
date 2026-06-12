@echo off
rem Auto-sync changes to GitHub
setlocal

rem Stage all changes
git add -A

rem Check if there are any staged changes
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No changes to commit.
    exit /b 0
)

rem Commit with a default message and timestamp
for /f "tokens=*" %%i in ('date /t') do set CURDATE=%%i
for /f "tokens=*" %%i in ('time /t') do set CURTIME=%%i
set MSG=Auto sync %CURDATE% %CURTIME%

git commit -m "%MSG%"

rem Push to the current branch
git push

endlocal
