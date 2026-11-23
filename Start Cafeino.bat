@echo off
title Cafeino Bistro - Start
rem "& exit /b" on the same line: an update may rewrite this file while it runs, so cmd must not read further.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-cafeino.ps1" %* & exit /b
