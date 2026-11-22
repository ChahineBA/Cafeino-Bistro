@echo off
title Cafeino Bistro - Start
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-cafeino.ps1" %*
