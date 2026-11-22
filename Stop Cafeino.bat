@echo off
title Cafeino Bistro - Stop
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-cafeino.ps1"
