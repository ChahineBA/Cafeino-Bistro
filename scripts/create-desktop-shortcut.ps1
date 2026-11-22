# Creates a "Cafeino Bistro" shortcut on this user's desktop that runs "Start Cafeino.bat".
# Run once per computer (double-click "Create Desktop Shortcut.bat" in this folder).
$ErrorActionPreference = 'Stop'
$Root    = Split-Path -Parent $PSScriptRoot
$Target  = Join-Path $Root 'Start Cafeino.bat'
$Icon    = Join-Path $PSScriptRoot 'cafeino.ico'
$Desktop = [Environment]::GetFolderPath('Desktop')   # handles OneDrive-redirected desktops
$Link    = Join-Path $Desktop 'Cafeino Bistro.lnk'

if (-not (Test-Path $Target)) { throw "Not found: $Target" }

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($Link)
$shortcut.TargetPath       = $Target
$shortcut.WorkingDirectory = $Root
$shortcut.IconLocation     = "$Icon,0"
$shortcut.Description      = 'Start the Cafeino Bistro till'
$shortcut.WindowStyle      = 1   # normal window, so progress and any problem message are visible
$shortcut.Save()

Write-Host ''
Write-Host "  Shortcut created: $Link" -ForegroundColor Green
Start-Sleep -Seconds 3
